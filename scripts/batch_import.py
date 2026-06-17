#!/usr/bin/env python3
"""
批量歌曲导入工具
将指定文件夹中的音频文件批量导入到 music-player 项目中

支持两种导入模式:
  1. 本地文件导入: 从文件夹读取 .mp3/.flac/.m4a 等音频文件
  2. URL 导入: 从 info.txt 读取远程音频 URL，无需本地文件

用法:
    python batch_import.py <源文件夹路径> [选项]

选项:
    --album-id <id>      指定专辑ID（已有专辑）
    --album-name <name>  新建专辑名称
    --artist <name>      默认歌手名
    --genre <genre>      默认流派
    --dry-run            模拟运行，不实际修改文件
    --help               显示帮助

源文件夹结构示例:
    /path/to/songs/
        ├── 周杰伦 - 晴天.mp3
        ├── 周杰伦 - 晴天.jpg      (可选封面)
        ├── 周杰伦 - 晴天.lrc      (可选歌词)
        ├── 林俊杰 - 江南.mp3
        ├── info.txt               (可选元数据文件)
        └── ...

info.txt 详细说明:
    info.txt 用于精确控制每首歌曲的元数据，支持以下两种格式:

    格式一: 本地文件模式（补充已有音频文件的元数据）
        歌曲名|歌手|专辑|流派
        歌手 - 歌曲名|专辑|流派

        示例:
        # 以下两行等价
        晴天|周杰伦|叶惠美|pop
        周杰伦 - 晴天|叶惠美|pop

        说明: 工具会根据歌曲名匹配文件夹中的音频文件（.mp3/.flac 等）

    格式二: URL 模式（直接指定远程音频地址）
        url:音频地址|歌曲名|歌手|专辑|流派|封面URL|MV URL

        示例:
        url:https://example.com/music/qingtian.mp3|周杰伦|叶惠美|pop|https://example.com/cover/qingtian.jpg
        url:https://example.com/music/jiangnan.mp3|林俊杰|第二天堂|pop|

        说明:
        - 以 "url:" 开头表示远程音频
        - 封面URL 可选，留空则使用默认封面
        - 歌词不可用（远程模式暂不支持歌词）

    封面URL 支持:
        - 本地文件模式也支持封面URL（第5个字段）
        - 优先级: info.txt URL > 本地同名图片 > 默认封面
        - URL 支持 http/https，会自动下载到本地

    混合使用:
        可以在同一个 info.txt 中混合使用两种格式:
        # 本地文件（带远程封面）
        晴天|周杰伦|叶惠美|pop|https://example.com/cover/qingtian.jpg
        # 本地文件（无封面，使用本地同名图片）
        江南|林俊杰|第二天堂|pop
        # 远程URL
        url:https://example.com/music/new_song.mp3|新歌|歌手|专辑|pop|https://example.com/cover.jpg

    注意:
        - 以 # 开头的行为注释
        - 每行一首歌曲
        - 使用 | 分隔各字段
        - 字段说明: 歌曲名 | 歌手 | 专辑 | 流派 | (可选)封面URL | (可选)MV URL

示例:
    # 本地文件导入
    python batch_import.py ~/Downloads/新歌 --album-name "夏日精选" --artist "群星" --genre "pop"

    # 添加到已有专辑
    python batch_import.py ~/Downloads/新歌 --album-id 14 --genre "pop"

    # URL 导入（只需 info.txt，不需要音频文件）
    python batch_import.py ./url_songs --album-name "网络歌曲" --artist "群星"

    # 模拟运行
    python batch_import.py ~/Downloads/新歌 --album-name "测试" --dry-run
"""

import os
import sys
import json
import shutil
import hashlib
import argparse
import urllib.request
from pathlib import Path
from datetime import datetime

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "public" / "data"
AUDIO_DIR = PROJECT_ROOT / "public" / "audio"
COVER_DIR = PROJECT_ROOT / "public" / "images" / "covers"
LYRICS_DIR = PROJECT_ROOT / "public" / "data" / "lyrics"
SONGS_JSON = DATA_DIR / "songs.json"

# 支持的音频格式
AUDIO_EXTS = {'.mp3', '.flac', '.m4a', '.wav', '.ogg', '.aac'}
COVER_EXTS = {'.jpg', '.jpeg', '.png', '.webp'}
LYRICS_EXTS = {'.lrc'}


def load_songs_json():
    with open(SONGS_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_songs_json(data):
    with open(SONGS_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_next_id(data):
    if not data.get('songs'):
        return 1
    return max(s['id'] for s in data['songs']) + 1


def get_next_album_id(data):
    if not data.get('albums'):
        return 1
    return max(a['id'] for a in data['albums']) + 1


def parse_filename(filename):
    """从文件名解析歌手和歌曲名"""
    name = Path(filename).stem
    if ' - ' in name:
        parts = name.split(' - ', 1)
        return parts[1].strip(), parts[0].strip()
    if '-' in name:
        parts = name.split('-', 1)
        return parts[1].strip(), parts[0].strip()
    return name.strip(), ""


def parse_info_file(info_path):
    """
    解析 info.txt 文件，返回两种数据:
    
    1. local_meta: {歌曲名: {artist, album, genre, coverUrl}}  -- 本地文件的元数据补充
    2. url_songs: [{title, artist, album, genre, audioUrl, coverUrl, mvUrl}]  -- URL 导入的歌曲
    
    格式:
        本地: 歌曲名|歌手|专辑|流派|封面URL
        URL:  url:音频地址|歌曲名|歌手|专辑|流派|封面URL|MV URL
    """
    local_meta = {}
    url_songs = []
    
    if not info_path.exists():
        return local_meta, url_songs
    
    with open(info_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            parts = line.split('|')
            
            if parts[0].startswith('url:'):
                # === URL 模式 ===
                # url:音频地址|歌曲名|歌手|专辑|流派|封面URL|MV URL
                audio_url = parts[0][4:].strip()
                if not audio_url:
                    print(f"警告: 第{line_num}行 URL 为空，跳过")
                    continue
                
                title = parts[1].strip() if len(parts) > 1 else "未知歌曲"
                artist = parts[2].strip() if len(parts) > 2 else ""
                album = parts[3].strip() if len(parts) > 3 else ""
                genre = parts[4].strip() if len(parts) > 4 else ""
                cover_url = parts[5].strip() if len(parts) > 5 else ""
                mv_url = parts[6].strip() if len(parts) > 6 else ""
                
                url_songs.append({
                    'title': title,
                    'artist': artist,
                    'album': album,
                    'genre': genre,
                    'audioUrl': audio_url,
                    'coverUrl': cover_url,
                    'mvUrl': mv_url
                })
            else:
                # === 本地文件模式 ===
                # 歌曲名|歌手|专辑|流派|封面URL
                # 或: 歌手 - 歌曲名|专辑|流派|封面URL
                if len(parts) < 2:
                    print(f"警告: 第{line_num}行格式不正确，跳过: {line}")
                    continue
                
                first_field = parts[0].strip()
                
                if ' - ' in first_field:
                    artist, title = first_field.split(' - ', 1)
                    artist = artist.strip()
                    title = title.strip()
                else:
                    title = first_field
                    artist = parts[1].strip() if len(parts) > 1 else ""
                
                local_meta[title] = {
                    'artist': artist,
                    'album': parts[2].strip() if len(parts) > 2 else '',
                    'genre': parts[3].strip() if len(parts) > 3 else '',
                    'coverUrl': parts[4].strip() if len(parts) > 4 else ''
                }
    
    return local_meta, url_songs


def get_audio_duration(audio_path):
    """获取音频文件时长（秒）"""
    try:
        from mutagen.mp3 import MP3
        from mutagen.flac import FLAC
        from mutagen.m4a import M4A
        
        ext = audio_path.suffix.lower()
        if ext == '.mp3':
            audio = MP3(str(audio_path))
        elif ext == '.flac':
            audio = FLAC(str(audio_path))
        elif ext == '.m4a':
            audio = M4A(str(audio_path))
        else:
            return 0
        
        return int(audio.info.length)
    except ImportError:
        print("  提示: 安装 mutagen 可自动读取时长 (pip install mutagen)")
        return 0
    except Exception as e:
        print(f"  警告: 无法读取时长: {e}")
        return 0


def hash_filename(filepath):
    """生成文件哈希作为唯一文件名"""
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            hasher.update(chunk)
    return hasher.hexdigest()[:12]


def hash_string(text):
    """对字符串生成哈希"""
    hasher = hashlib.md5()
    hasher.update(text.encode('utf-8'))
    return hasher.hexdigest()[:12]


def find_cover(source_dir, audio_name):
    """查找同名的封面图片"""
    for ext in COVER_EXTS:
        cover_path = source_dir / f"{audio_name}{ext}"
        if cover_path.exists():
            return cover_path
    return None


def find_lyrics(source_dir, audio_name):
    """查找同名的歌词文件"""
    for ext in LYRICS_EXTS:
        lyrics_path = source_dir / f"{audio_name}{ext}"
        if lyrics_path.exists():
            return lyrics_path
    return None


def download_file(url, dest_path):
    """下载远程文件到本地"""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(dest_path, 'wb') as f:
                f.write(response.read())
        return True
    except Exception as e:
        print(f"  警告: 下载失败 {url}: {e}")
        return False


def process_local_song(source_dir, audio_file, local_meta, args, next_id, album_id=None):
    """处理本地音频文件"""
    audio_path = source_dir / audio_file
    audio_name = Path(audio_file).stem
    
    # 解析元数据
    title, artist = parse_filename(audio_file)
    
    # info.txt 覆盖
    info_cover_url = ""  # info.txt 中指定的封面URL
    if title in local_meta:
        meta = local_meta[title]
        artist = meta.get('artist') or artist
        album_name = meta.get('album') or args.album_name or ''
        genre = meta.get('genre') or args.genre or ''
        info_cover_url = meta.get('coverUrl', '')
    else:
        album_name = args.album_name or ''
        genre = args.genre or ''
    
    if not artist and args.artist:
        artist = args.artist
    
    # 获取时长
    duration = get_audio_duration(audio_path)
    
    # 生成唯一文件名
    file_hash = hash_filename(audio_path)
    ext = Path(audio_file).suffix
    new_audio_name = f"{file_hash}{ext}"
    
    # 复制音频
    if not args.dry_run:
        shutil.copy2(audio_path, AUDIO_DIR / new_audio_name)
    
    # 处理封面（优先级: info.txt URL > 本地同名图片 > 默认封面）
    cover_url = "/music-player/images/covers/default_cover.jpg"
    
    # 1. 先检查 info.txt 中是否指定了封面URL
    if info_cover_url:
        if info_cover_url.startswith('http'):
            # 远程URL，下载到本地
            cover_ext = '.jpg'
            if '.png' in info_cover_url:
                cover_ext = '.png'
            new_cover_name = f"{file_hash}_cover{cover_ext}"
            if not args.dry_run:
                print(f"  下载封面: {info_cover_url}")
                if download_file(info_cover_url, COVER_DIR / new_cover_name):
                    cover_url = f"/music-player/images/covers/{new_cover_name}"
                else:
                    cover_url = "/music-player/images/covers/default_cover.jpg"
            else:
                cover_url = f"/music-player/images/covers/{new_cover_name}"
        else:
            # 本地路径
            cover_url = info_cover_url
    else:
        # 2. 查找同名的本地封面图片
        cover_path = find_cover(source_dir, audio_name)
        if cover_path:
            cover_ext = cover_path.suffix
            new_cover_name = f"{file_hash}_cover{cover_ext}"
            if not args.dry_run:
                shutil.copy2(cover_path, COVER_DIR / new_cover_name)
            cover_url = f"/music-player/images/covers/{new_cover_name}"
    
    # 处理歌词
    lyrics_path = find_lyrics(source_dir, audio_name)
    if lyrics_path:
        if not args.dry_run:
            shutil.copy2(lyrics_path, LYRICS_DIR / f"{file_hash}.lrc")
    
    song_data = {
        "id": next_id,
        "title": title,
        "artist": artist,
        "album": album_name or "未知专辑",
        "albumId": album_id or 0,
        "duration": duration,
        "cover": cover_url,
        "audioUrl": f"/music-player/audio/{new_audio_name}"
    }
    
    if genre:
        song_data["genre"] = genre
    
    return song_data


def process_url_song(url_song, args, next_id, album_id=None):
    """处理 URL 远程歌曲"""
    title = url_song['title']
    artist = url_song.get('artist') or args.artist or ''
    album_name = url_song.get('album') or args.album_name or ''
    genre = url_song.get('genre') or args.genre or ''
    remote_audio_url = url_song['audioUrl']
    remote_cover_url = url_song.get('coverUrl', '')
    mv_url = url_song.get('mvUrl', '')
    
    # 生成唯一文件名
    file_hash = hash_string(remote_audio_url)
    
    # 确定音频URL
    # 如果是远程URL，保持原样（项目已支持远程URL）
    audio_url = remote_audio_url
    
    # 如果是相对路径或需要本地化，则下载
    if remote_audio_url.startswith('http'):
        # 判断是否需要下载到本地
        # 默认保持远程URL，如果用户想本地化可以手动处理
        audio_url = remote_audio_url
    else:
        audio_url = remote_audio_url
    
    # 处理封面
    if remote_cover_url:
        if remote_cover_url.startswith('http'):
            # 下载远程封面到本地
            cover_ext = '.jpg'
            if '.png' in remote_cover_url:
                cover_ext = '.png'
            new_cover_name = f"{file_hash}_cover{cover_ext}"
            if not args.dry_run:
                print(f"  下载封面: {remote_cover_url}")
                if download_file(remote_cover_url, COVER_DIR / new_cover_name):
                    cover_url = f"/music-player/images/covers/{new_cover_name}"
                else:
                    cover_url = "/music-player/images/covers/default_cover.jpg"
            else:
                cover_url = f"/music-player/images/covers/{new_cover_name}"
        else:
            cover_url = remote_cover_url
    else:
        cover_url = "/music-player/images/covers/default_cover.jpg"
    
    song_data = {
        "id": next_id,
        "title": title,
        "artist": artist,
        "album": album_name or "未知专辑",
        "albumId": album_id or 0,
        "duration": 0,  # URL 模式无法自动获取时长
        "cover": cover_url,
        "audioUrl": audio_url
    }
    
    if genre:
        song_data["genre"] = genre
    if mv_url:
        song_data["mvUrl"] = mv_url
    
    return song_data


def create_album(data, album_name, artist, cover, song_ids, description=""):
    """创建新专辑"""
    album_id = get_next_album_id(data)
    album = {
        "id": album_id,
        "name": album_name,
        "artist": artist or "群星",
        "cover": cover or "/music-player/images/covers/default_cover.jpg",
        "songs": song_ids,
        "releaseDate": datetime.now().strftime("%Y-%m-%d"),
        "description": description or f"{album_name}精选歌曲合集"
    }
    data['albums'].append(album)
    return album_id


def main():
    parser = argparse.ArgumentParser(
        description='批量导入歌曲到 music-player（支持本地文件和远程URL）',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
info.txt 格式说明:

  本地文件模式（补充已有音频文件的元数据）:
    歌曲名|歌手|专辑|流派
    歌手 - 歌曲名|专辑|流派

  URL 模式（直接指定远程音频地址）:
    url:音频地址|歌曲名|歌手|专辑|流派|封面URL|MV URL

  混合使用示例:
    # 本地文件
    晴天|周杰伦|叶惠美|pop
    # 远程URL
    url:https://example.com/song.mp3|新歌|歌手|专辑|pop|https://example.com/cover.jpg

使用示例:
    python batch_import.py ~/Downloads/新歌 --album-name "夏日精选" --artist "群星"
    python batch_import.py ./url_songs --album-name "网络歌曲"
    python batch_import.py ~/Downloads/新歌 --album-id 14 --dry-run
        """
    )
    parser.add_argument('source_dir', help='源文件夹路径')
    parser.add_argument('--album-id', type=int, help='指定已有专辑ID')
    parser.add_argument('--album-name', help='新建专辑名称')
    parser.add_argument('--artist', help='默认歌手名')
    parser.add_argument('--genre', help='默认流派')
    parser.add_argument('--description', help='专辑描述')
    parser.add_argument('--dry-run', action='store_true', help='模拟运行，不实际修改')
    
    args = parser.parse_args()
    
    source_dir = Path(args.source_dir)
    if not source_dir.exists():
        print(f"错误: 文件夹不存在: {source_dir}")
        sys.exit(1)
    
    # 确保目标目录存在
    if not args.dry_run:
        AUDIO_DIR.mkdir(parents=True, exist_ok=True)
        COVER_DIR.mkdir(parents=True, exist_ok=True)
        LYRICS_DIR.mkdir(parents=True, exist_ok=True)
    
    # 加载数据
    print("=" * 50)
    print("  批量歌曲导入工具")
    print("=" * 50)
    print(f"\n加载 songs.json...")
    data = load_songs_json()
    
    # 解析 info.txt
    info_path = source_dir / "info.txt"
    local_meta, url_songs = parse_info_file(info_path)
    
    if info_path.exists():
        print(f"info.txt: {len(local_meta)} 首本地元数据, {len(url_songs)} 首URL歌曲")
    else:
        print("info.txt: 未找到（将使用文件名解析）")
    
    # 查找本地音频文件
    audio_files = []
    for ext in AUDIO_EXTS:
        audio_files.extend(source_dir.glob(f"*{ext}"))
    
    print(f"本地音频文件: {len(audio_files)} 首")
    print(f"URL 远程歌曲: {len(url_songs)} 首")
    print(f"总计: {len(audio_files) + len(url_songs)} 首")
    
    if len(audio_files) + len(url_songs) == 0:
        print(f"\n错误: 没有找到任何可导入的歌曲")
        print("请确保文件夹中有音频文件，或创建了 info.txt 指定URL")
        sys.exit(1)
    
    # 获取起始ID
    next_id = get_next_id(data)
    print(f"起始歌曲ID: {next_id}")
    
    # 处理专辑
    album_id = args.album_id
    if args.album_name and not album_id:
        print(f"\n将创建新专辑: {args.album_name}")
    elif album_id:
        album = next((a for a in data['albums'] if a['id'] == album_id), None)
        if album:
            print(f"\n将添加到已有专辑: {album['name']} (ID: {album_id})")
        else:
            print(f"\n警告: 未找到专辑ID {album_id}，歌曲将不关联专辑")
            album_id = None
    
    # === 处理本地文件 ===
    imported_songs = []
    imported_ids = []
    
    if audio_files:
        print(f"\n{'=' * 50}")
        print(f"  处理本地音频文件 ({len(audio_files)} 首)")
        print(f"{'=' * 50}")
        
        for audio_file in sorted(audio_files):
            print(f"\n[{len(imported_songs) + 1}] {audio_file.name}")
            
            song = process_local_song(
                source_dir, audio_file.name, local_meta, args, next_id, album_id
            )
            
            print(f"    标题: {song['title']}")
            print(f"    歌手: {song['artist']}")
            print(f"    专辑: {song['album']}")
            print(f"    时长: {song['duration']}秒")
            print(f"    封面: {song['cover']}")
            print(f"    音频: {song['audioUrl']}")
            
            imported_songs.append(song)
            imported_ids.append(next_id)
            next_id += 1
    
    # === 处理 URL 歌曲 ===
    if url_songs:
        print(f"\n{'=' * 50}")
        print(f"  处理 URL 远程歌曲 ({len(url_songs)} 首)")
        print(f"{'=' * 50}")
        
        for i, url_song in enumerate(url_songs):
            print(f"\n[{len(imported_songs) + 1}] {url_song['title']}")
            print(f"    URL: {url_song['audioUrl']}")
            
            song = process_url_song(url_song, args, next_id, album_id)
            
            print(f"    标题: {song['title']}")
            print(f"    歌手: {song['artist']}")
            print(f"    专辑: {song['album']}")
            print(f"    封面: {song['cover']}")
            print(f"    音频: {song['audioUrl']}")
            if song.get('mvUrl'):
                print(f"    MV: {song['mvUrl']}")
            
            imported_songs.append(song)
            imported_ids.append(next_id)
            next_id += 1
    
    # === 创建新专辑 ===
    if args.album_name and not args.album_id:
        first_cover = imported_songs[0]['cover'] if imported_songs else None
        album_id = create_album(
            data, args.album_name, args.artist or "群星",
            first_cover, imported_ids, args.description
        )
        print(f"\n创建专辑成功: {args.album_name} (ID: {album_id})")
        
        for song in imported_songs:
            song['albumId'] = album_id
    
    # 添加到数据
    data['songs'].extend(imported_songs)
    
    # 更新已有专辑的歌曲列表
    if args.album_id:
        album = next((a for a in data['albums'] if a['id'] == args.album_id), None)
        if album:
            album['songs'].extend(imported_ids)
    
    # === 保存 ===
    if not args.dry_run:
        save_songs_json(data)
        print(f"\n{'=' * 50}")
        print(f"  导入完成!")
        print(f"{'=' * 50}")
        print(f"  共导入: {len(imported_songs)} 首歌曲")
        print(f"  ID范围: {imported_ids[0]} - {imported_ids[-1]}")
        if album_id:
            print(f"  专辑ID: {album_id}")
        print(f"  数据文件: {SONGS_JSON}")
    else:
        print(f"\n{'=' * 50}")
        print(f"  模拟运行完成（未实际修改）")
        print(f"{'=' * 50}")
        print(f"  共 {len(imported_songs)} 首歌曲将被导入")
    
    print(f"\n下一步:")
    print(f"  1. npm run dev  查看效果")
    print(f"  2. 编辑 songs.json 调整细节")
    print(f"  3. git add -A && git commit")


if __name__ == '__main__':
    main()

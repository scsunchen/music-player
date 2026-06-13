#!/usr/bin/env python3
"""
批量歌曲导入工具
将指定文件夹中的音频文件批量导入到 music-player 项目中

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

info.txt 格式:
    歌手 - 歌曲名|专辑名|流派
    或
    歌曲名|歌手|专辑名|流派

示例:
    python batch_import.py ~/Downloads/新歌 --album-name "夏日精选" --artist "群星" --genre "pop"
"""

import os
import sys
import json
import shutil
import hashlib
import argparse
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
    """加载 songs.json"""
    with open(SONGS_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_songs_json(data):
    """保存 songs.json"""
    with open(SONGS_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_next_id(data):
    """获取下一个可用的歌曲ID"""
    if not data.get('songs'):
        return 1
    return max(s['id'] for s in data['songs']) + 1


def get_next_album_id(data):
    """获取下一个可用的专辑ID"""
    if not data.get('albums'):
        return 1
    return max(a['id'] for a in data['albums']) + 1


def parse_filename(filename):
    """
    从文件名解析歌手和歌曲名
    支持格式:
        歌手 - 歌曲名.mp3
        歌手-歌曲名.mp3
        歌曲名.mp3 (无歌手)
    """
    name = Path(filename).stem
    
    # 尝试 "歌手 - 歌曲名" 格式
    if ' - ' in name:
        parts = name.split(' - ', 1)
        return parts[1].strip(), parts[0].strip()
    
    # 尝试 "歌手-歌曲名" 格式
    if '-' in name and ' - ' not in name:
        parts = name.split('-', 1)
        return parts[1].strip(), parts[0].strip()
    
    # 只有歌曲名
    return name.strip(), ""


def parse_info_file(info_path):
    """
    解析 info.txt 文件
    格式:
        歌曲名|歌手|专辑|流派
        或
        歌手 - 歌曲名|专辑|流派
    """
    metadata = {}
    if not info_path.exists():
        return metadata
    
    with open(info_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            parts = line.split('|')
            if len(parts) >= 2:
                # 尝试解析
                if ' - ' in parts[0]:
                    artist, title = parts[0].split(' - ', 1)
                    metadata[title.strip()] = {
                        'artist': artist.strip(),
                        'album': parts[1].strip() if len(parts) > 1 else '',
                        'genre': parts[2].strip() if len(parts) > 2 else ''
                    }
                else:
                    metadata[parts[0].strip()] = {
                        'artist': parts[1].strip() if len(parts) > 1 else '',
                        'album': parts[2].strip() if len(parts) > 2 else '',
                        'genre': parts[3].strip() if len(parts) > 3 else ''
                    }
    
    return metadata


def get_audio_duration(audio_path):
    """获取音频文件时长（秒）"""
    try:
        # 尝试使用 mutagen
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
        print("警告: 未安装 mutagen，无法读取音频时长。请运行: pip install mutagen")
        return 0
    except Exception as e:
        print(f"警告: 无法读取时长 {audio_path}: {e}")
        return 0


def hash_filename(filepath):
    """生成文件哈希作为唯一文件名"""
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            hasher.update(chunk)
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


def process_song(source_dir, audio_file, data, args, next_id, album_id=None):
    """处理单首歌曲"""
    audio_path = source_dir / audio_file
    audio_name = Path(audio_file).stem
    
    # 解析元数据
    title, artist = parse_filename(audio_file)
    
    # 如果有 info.txt，覆盖解析结果
    info_metadata = parse_info_file(source_dir / "info.txt")
    if title in info_metadata:
        meta = info_metadata[title]
        artist = meta.get('artist', artist)
        album_name = meta.get('album', args.album_name or '')
        genre = meta.get('genre', args.genre or '')
    else:
        album_name = args.album_name or ''
        genre = args.genre or ''
    
    # 使用默认歌手
    if not artist and args.artist:
        artist = args.artist
    
    # 获取时长
    duration = get_audio_duration(audio_path)
    
    # 生成唯一文件名
    file_hash = hash_filename(audio_path)
    ext = Path(audio_file).suffix
    new_audio_name = f"{file_hash}{ext}"
    
    # 复制音频文件
    dest_audio = AUDIO_DIR / new_audio_name
    if not args.dry_run:
        shutil.copy2(audio_path, dest_audio)
    
    # 处理封面
    cover_path = find_cover(source_dir, audio_name)
    if cover_path:
        cover_ext = cover_path.suffix
        new_cover_name = f"{file_hash}_cover{cover_ext}"
        dest_cover = COVER_DIR / new_cover_name
        if not args.dry_run:
            shutil.copy2(cover_path, dest_cover)
        cover_url = f"/music-player/images/covers/{new_cover_name}"
    else:
        # 使用默认封面
        cover_url = "/music-player/images/covers/default_cover.jpg"
    
    # 处理歌词
    lyrics_path = find_lyrics(source_dir, audio_name)
    if lyrics_path:
        dest_lyrics = LYRICS_DIR / f"{file_hash}.lrc"
        if not args.dry_run:
            shutil.copy2(lyrics_path, dest_lyrics)
    
    # 构建歌曲数据
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
        description='批量导入歌曲到 music-player',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
    python batch_import.py ~/Downloads/新歌 --album-name "夏日精选" --artist "群星"
    python batch_import.py ~/Downloads/新歌 --album-id 14 --genre "pop"
    python batch_import.py ~/Downloads/新歌 --dry-run  # 模拟运行
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
    print("加载 songs.json...")
    data = load_songs_json()
    
    # 查找音频文件
    audio_files = []
    for ext in AUDIO_EXTS:
        audio_files.extend(source_dir.glob(f"*{ext}"))
    
    if not audio_files:
        print(f"错误: 在 {source_dir} 中未找到音频文件")
        sys.exit(1)
    
    print(f"找到 {len(audio_files)} 首歌曲")
    
    # 获取起始ID
    next_id = get_next_id(data)
    print(f"起始歌曲ID: {next_id}")
    
    # 处理专辑
    album_id = args.album_id
    if args.album_name and not album_id:
        print(f"创建新专辑: {args.album_name}")
    elif album_id:
        album = next((a for a in data['albums'] if a['id'] == album_id), None)
        if album:
            print(f"添加到已有专辑: {album['name']} (ID: {album_id})")
        else:
            print(f"警告: 未找到专辑ID {album_id}")
            album_id = None
    
    # 处理每首歌曲
    imported_songs = []
    imported_ids = []
    
    for audio_file in sorted(audio_files):
        print(f"\n处理: {audio_file.name}")
        
        song = process_song(
            source_dir, audio_file.name, data, args, next_id, album_id
        )
        
        print(f"  标题: {song['title']}")
        print(f"  歌手: {song['artist']}")
        print(f"  时长: {song['duration']}秒")
        print(f"  封面: {song['cover']}")
        print(f"  音频: {song['audioUrl']}")
        
        imported_songs.append(song)
        imported_ids.append(next_id)
        next_id += 1
    
    # 创建新专辑
    if args.album_name and not args.album_id:
        # 使用第一首歌的封面作为专辑封面
        first_cover = imported_songs[0]['cover'] if imported_songs else None
        album_id = create_album(
            data, args.album_name, args.artist or "群星", 
            first_cover, imported_ids, args.description
        )
        print(f"\n创建专辑成功: {args.album_name} (ID: {album_id})")
        
        # 更新歌曲的 albumId
        for song in imported_songs:
            song['albumId'] = album_id
    
    # 添加到数据
    data['songs'].extend(imported_songs)
    
    # 更新已有专辑的歌曲列表
    if args.album_id:
        album = next((a for a in data['albums'] if a['id'] == args.album_id), None)
        if album:
            album['songs'].extend(imported_ids)
    
    # 保存
    if not args.dry_run:
        save_songs_json(data)
        print(f"\n✅ 导入完成！共导入 {len(imported_songs)} 首歌曲")
        print(f"数据已保存到: {SONGS_JSON}")
    else:
        print(f"\n📝 模拟运行完成，共 {len(imported_songs)} 首歌曲（未实际修改）")
    
    # 打印导入摘要
    print("\n导入摘要:")
    print(f"  歌曲数量: {len(imported_songs)}")
    print(f"  ID范围: {imported_ids[0]} - {imported_ids[-1]}")
    if album_id:
        print(f"  专辑ID: {album_id}")
    print(f"  音频文件: {AUDIO_DIR}")
    print(f"  封面文件: {COVER_DIR}")
    print(f"  歌词文件: {LYRICS_DIR}")
    
    # 打印下一步建议
    print("\n下一步:")
    print("  1. 运行开发服务器查看效果: npm run dev")
    print("  2. 如需调整，编辑 songs.json 或重新运行脚本")
    print("  3. 提交代码: git add -A && git commit -m 'feat: 批量导入歌曲'")


if __name__ == '__main__':
    main()

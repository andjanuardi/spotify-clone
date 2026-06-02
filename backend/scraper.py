import yt_dlp
import asyncio
from typing import Optional


async def search_youtube_url(url: str, max_results: int = 10):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': 'in_playlist',
        'playlistend': max_results,
    }

    def _search():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(url, download=False)
            entries = []
            for entry in result.get('entries', []):
                duration = entry.get('duration') or 0
                if duration > 500:
                    continue
                entries.append({
                    'video_id': entry.get('id'),
                    'title': entry.get('title', 'Unknown Title'),
                    'artist': entry.get('channel', 'Unknown Artist'),
                    'thumbnail': entry.get('thumbnail') or f"https://img.youtube.com/vi/{entry.get('id')}/hqdefault.jpg",
                    'duration': duration,
                    'url': f"https://youtube.com/watch?v={entry.get('id')}",
                })
            return entries

    return await asyncio.to_thread(_search)


async def search_youtube(query: str, max_results: int = 10):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': 'in_playlist',
    }

    def _search():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(f"ytsearch{max_results}:{query}", download=False)
            entries = []
            for entry in result.get('entries', []):
                duration = entry.get('duration') or 0
                if duration > 500:
                    continue
                entries.append({
                    'video_id': entry.get('id'),
                    'title': entry.get('title', 'Unknown Title'),
                    'artist': entry.get('channel', 'Unknown Artist'),
                    'thumbnail': entry.get('thumbnail') or f"https://img.youtube.com/vi/{entry.get('id')}/hqdefault.jpg",
                    'duration': duration,
                    'url': f"https://youtube.com/watch?v={entry.get('id')}",
                })
            return entries

    return await asyncio.to_thread(_search)


async def get_audio_url(video_id: str) -> Optional[str]:
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'format': 'bestaudio[ext=m4a]/bestaudio/best',
    }

    def _get_url():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://youtube.com/watch?v={video_id}",
                download=False
            )
            return info.get('url')

    try:
        return await asyncio.to_thread(_get_url)
    except Exception as e:
        print(f"Error getting audio URL for {video_id}: {e}")
        return None


async def get_video_info(video_id: str) -> Optional[dict]:
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
    }

    def _get_info():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://youtube.com/watch?v={video_id}",
                download=False
            )
            return {
                'video_id': info.get('id'),
                'title': info.get('title', 'Unknown Title'),
                'artist': info.get('channel', 'Unknown Artist'),
                'thumbnail': info.get('thumbnail', ''),
                'duration': info.get('duration', 0),
                'url': info.get('url'),
            }

    try:
        return await asyncio.to_thread(_get_info)
    except Exception as e:
        print(f"Error getting video info for {video_id}: {e}")
        return None

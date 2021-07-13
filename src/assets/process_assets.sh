#!/bin/bash

# by default this only processes new files
# if you want to update an existing file, delete the output first

# set to "error" to suppress logs
ffmpeg_log="error"

# enter the originals directory
cd originals

# handle silenced video
mkdir -p ../synced/videos
for video in videos/*.mp4; do
  echo "Processing $video..."

  # create the videos
  if [ ! -f  ../synced/$video ]; then
    ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
    -i $video \
    -an \
    -vcodec libx264 \
    -preset veryslow \
    -strict -2 \
    -pix_fmt yuv420p \
    -crf 29 \
    -vf scale=1024:-2 \
    -movflags +faststart \
    ../synced/$video
  fi

  # create posters
  if [ ! -f ../synced/$video.jpg ]; then
    ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
    -i $video \
    -vf scale=1024:-2 \
    -qscale:v 4 \
    -frames:v 1 \
    ../synced/$video.jpg;
  fi
done

# convert images
# requires ImageMagick 7
mkdir -p ../synced/images
for img in images/*.jpg; do
  echo "Processing $img..."
  if [ ! -f "../synced/$img" ]; then
    magick convert $img -resize 1200x800\> -quality 70 ../synced/$img
  fi
done
for img in images/*.png; do
  echo "Processing $img..."
  if [ ! -f "../synced/$img" ]; then
    magick convert $img -resize 1200x800\> \
      -define png:compression-filter=5 \
      -define png:compression-level=9 \
      ../synced/$img;
  fi
done
for img in images/*.jpeg; do
  echo "Processing $img..."
  if [ ! -f "../synced/$img" ]; then
    magick convert $img -resize 1200x800\> \
      -define png:compression-filter=5 \
      -define png:compression-level=9 \
      ../synced/$img;
  fi
done

# exit back to assets
cd ..
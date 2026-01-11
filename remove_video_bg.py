#!/usr/bin/env python3
"""
影片背景移除工具
使用 rembg 移除影片中的背景，保留主體（狗狗）
"""

import cv2
import numpy as np
from rembg import remove
from PIL import Image
import sys
import os

def remove_video_background(input_path, output_path, max_frames=None):
    """
    移除影片背景
    
    Args:
        input_path: 輸入影片路徑
        output_path: 輸出影片路徑
        max_frames: 最大處理幀數（None = 全部）
    """
    print(f"正在處理影片: {input_path}")
    
    # 開啟影片
    cap = cv2.VideoCapture(input_path)
    
    # 獲取影片資訊
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"影片資訊: {width}x{height}, {fps}fps, {total_frames} 幀")
    
    if max_frames:
        total_frames = min(total_frames, max_frames)
        print(f"將處理前 {total_frames} 幀")
    
    # 創建輸出目錄用於存放幀
    frames_dir = output_path.replace('.mp4', '_frames')
    os.makedirs(frames_dir, exist_ok=True)
    print(f"將幀保存到: {frames_dir}")
    
    frame_count = 0
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if max_frames and frame_count >= max_frames:
                break
            
            # 將 OpenCV BGR 轉換為 PIL RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            
            # 移除背景
            output_image = remove(pil_image)
            
            # 轉換回 OpenCV 格式（BGRA）
            output_array = np.array(output_image)
            
            # 如果有 alpha 通道，創建帶透明背景的圖像
            if output_array.shape[2] == 4:
                # 保存為 PNG（支持透明度）
                frame_path = os.path.join(frames_dir, f"frame_{frame_count:05d}.png")
                output_image.save(frame_path)
            else:
                # 無 alpha 通道，保存為 JPG
                frame_path = os.path.join(frames_dir, f"frame_{frame_count:05d}.jpg")
                output_image.save(frame_path)
            
            frame_count += 1
            if frame_count % 10 == 0:
                print(f"已處理 {frame_count}/{total_frames} 幀 ({frame_count/total_frames*100:.1f}%)")
    
    finally:
        cap.release()
    
    print(f"\n完成！幀已保存到: {frames_dir}")
    print(f"共處理 {frame_count} 幀")
    
    # 使用 ffmpeg 合成影片（支持透明背景）
    print("\n正在使用 ffmpeg 合成影片...")
    output_path_webm = output_path.replace('.mp4', '.webm')
    
    ffmpeg_cmd = f'ffmpeg -y -framerate {fps} -i {frames_dir}/frame_%05d.png -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 {output_path_webm}'
    
    print(f"執行: {ffmpeg_cmd}")
    os.system(ffmpeg_cmd)
    
    print(f"\n最終輸出: {output_path_webm}")
    
    return output_path_webm

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("使用方式: python remove_video_bg.py <input_video> [output_video] [max_frames]")
        print("範例: python remove_video_bg.py videos/dog-happy-1.mp4 videos/dog-happy-1-nobg.mp4 150")
        sys.exit(1)
    
    input_video = sys.argv[1]
    output_video = sys.argv[2] if len(sys.argv) > 2 else input_video.replace('.mp4', '-nobg.mp4')
    max_frames = int(sys.argv[3]) if len(sys.argv) > 3 else None
    
    if not os.path.exists(input_video):
        print(f"錯誤：找不到輸入檔案 {input_video}")
        sys.exit(1)
    
    remove_video_background(input_video, output_video, max_frames)

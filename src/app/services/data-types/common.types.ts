// 轮播数据结构
export interface Banner {
  targetId: number;
  url: string;
  imageUrl: string;
}

// 歌单分类标签数据结构
export interface HotTag {
  id: number;
  name: string;
  position: number;
}

// 推荐歌单的数据结构
export interface SongSheet {
  id: number;
  name: string;
  picUrl: string;
  playCount: number;
}

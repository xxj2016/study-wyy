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
  tracks: Song[];
}

// 歌手分类列表的数据结构
export interface Singer {
  id: number;
  name: string;
  picUrl: string;
  albumSize: number;
  musicSize: number;
}


// 歌单的数据结构
export interface Song {
  id: number;
  name: string;
  url: number;
  ar: Singer[];
  al: { id: number; name: string; picUrl: string };
  dt: number;
}


// 播放地址的数据结构
export interface SongUrl {
  id: number;
  url: number;
}

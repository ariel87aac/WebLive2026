export type StageLayout = 'fullscreen' | 'mainGuests' | 'grid';
export type ScenePreset = 'midnight' | 'studioBlue' | 'emerald' | 'sunset' | 'custom';
export type BannerStyle = 'lowerThird' | 'ticker' | 'headline';

export type RoomSceneState = {
  stageLayout: StageLayout;
  mainParticipantId: string | null;
  scenePreset: ScenePreset;
  sceneBackground: string;
  sceneAccent: string;
  bannerVisible: boolean;
  bannerText: string;
  bannerStyle: BannerStyle;
  bannerBackground: string;
  bannerTextColor: string;
};

export const DEFAULT_ROOM_SCENE_STATE: RoomSceneState = {
  stageLayout: 'mainGuests',
  mainParticipantId: null,
  scenePreset: 'studioBlue',
  sceneBackground: '#07111f',
  sceneAccent: '#38bdf8',
  bannerVisible: true,
  bannerText: 'Bienvenidos a nuestra transmision en vivo',
  bannerStyle: 'lowerThird',
  bannerBackground: '#0f172a',
  bannerTextColor: '#ffffff',
};

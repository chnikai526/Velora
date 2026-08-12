import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

export const AVATARS = [
  { id: 'cat', label: 'Cat', color: '#e9af7a', ears: 'M15 37 L25 10 38 31 M62 31 L75 10 85 37' },
  { id: 'panda', label: 'Panda', color: '#f4f2e9', ears: 'M14 35 C6 18 27 10 33 27 M68 27 C74 10 94 18 86 35' },
  { id: 'fox', label: 'Fox', color: '#ee875a', ears: 'M14 40 L22 8 42 31 M57 31 L78 8 86 40' },
  { id: 'bear', label: 'Bear', color: '#a97757', ears: 'M17 35 C7 14 32 9 36 29 M64 29 C68 9 93 14 83 35' },
  { id: 'frog', label: 'Frog', color: '#8fbe7d', ears: 'M17 39 C6 12 34 12 35 31 M65 31 C67 12 94 12 83 39' },
  { id: 'penguin', label: 'Penguin', color: '#536273', ears: 'M15 34 Q19 14 34 28 M66 28 Q81 14 85 34' },
  { id: 'owl', label: 'Owl', color: '#b4956e', ears: 'M16 38 L20 11 39 30 M60 30 L79 11 84 38' },
  { id: 'koala', label: 'Koala', color: '#a6b4bc', ears: 'M15 37 C2 15 30 9 37 30 M63 30 C70 9 98 15 85 37' },
  { id: 'tiger', label: 'Tiger', color: '#f0a653', ears: 'M14 39 L24 10 39 31 M61 31 L76 10 86 39' },
  { id: 'rabbit', label: 'Rabbit', color: '#e7b8c9', ears: 'M25 32 C13 3 30 -3 39 29 M61 29 C70 -3 87 3 75 32' },
];

export default function AnimalAvatar({ avatarId = 'cat', size = 88 }) {
  const avatar = AVATARS.find((item) => item.id === avatarId) || AVATARS[0];
  const special = avatar.id === 'panda' || avatar.id === 'owl';
  return <Svg width={size} height={size} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="49" fill="#f8f0df" />
    <Path d={avatar.ears} fill={avatar.color} stroke="#5d5147" strokeWidth="2" strokeLinejoin="round" />
    <Ellipse cx="50" cy="58" rx="36" ry="30" fill={avatar.color} />
    {special && <><Ellipse cx="34" cy="54" rx="13" ry="11" fill="#4e5660" opacity=".8"/><Ellipse cx="66" cy="54" rx="13" ry="11" fill="#4e5660" opacity=".8"/></>}
    {avatar.id === 'tiger' && <><Path d="M43 31l5 15M57 31l-5 15M29 43l10 7M71 43l-10 7" stroke="#71452e" strokeWidth="3" strokeLinecap="round"/></>}
    {avatar.id === 'penguin' && <Ellipse cx="50" cy="67" rx="24" ry="18" fill="#f5f2e9" />}
    <Circle cx="37" cy="56" r="4" fill="#332d29"/><Circle cx="63" cy="56" r="4" fill="#332d29"/>
    <Path d={avatar.id === 'frog' ? 'M45 67 Q50 74 55 67' : 'M45 68 Q50 72 55 68'} stroke="#4d3932" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <Ellipse cx="50" cy="63" rx={avatar.id === 'penguin' ? 5 : 3} ry="2.5" fill={avatar.id === 'penguin' ? '#eba747' : '#6e4b42'} />
  </Svg>;
}

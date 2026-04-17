# XR-app Summary And Detailed Design

## 1. Document Purpose

この文書は、`XR-app` サブプロジェクトで実施した検証内容、実装済み機能、ページごとの詳細設計、技術的な制約、今後の方針をまとめたものです。

対象読者は以下を想定します。

- 現在の PoC 状態を把握したい開発者
- Web 実装の限界とネイティブ移行判断を行いたい担当者
- `Phone-ar`、`Quest-ar`、`Immersive-ar`、`Immersive-ar-with-maker` の設計意図を確認したい実装者

## 2. Project Summary

`XR-app` は、ブラウザで動作する AR / MR 検証用サブプロジェクトです。配置先は `/root/Codex/XR-app` です。

採用している基本方針は以下です。

- スマートフォン向けと Quest 3 向けを無理に同一実装へ寄せない
- まず PoC として成立させることを優先する
- Quest 3 では `marker AR` と `immersive passthrough AR` を分離して検証する
- Web 技術だけで両者を完全統合するのではなく、限界点を確認する

現時点で用意しているページは以下の 4 つです。

- `phone-ar.html`
- `quest-ar.html`
- `immersive-ar.html`
- `immersive-ar-with-maker.html`

## 3. Goals And Requirements

### 3.1 Original Requirements

- 対応デバイス
  Meta Quest 3
  スマートフォン
- 機能要件
  AR マーカーを読み込む
  読み込んだ AR マーカーに応じて 3D オブジェクトと簡単な文章を表示する

### 3.2 Practical Interpretation

検証を進める中で、要件は以下の 2 系統に分かれました。

- スマートフォン
  カメラ映像の上でマーカーを認識し、その場所にオブジェクトと文章を表示する
- Quest 3
  1. ブラウザ上でマーカー認識を行う
  2. 没入型のパススルー表示を行う
  3. 可能であれば両者をつなぐ

このうち 1 と 2 は Web 技術でも成立しましたが、3 は近似的な PoC までに留まっています。

## 4. Technical Stack

### 4.1 Core Stack

- `Vite`
- `TypeScript`
- `three`
- `@vitejs/plugin-basic-ssl`

### 4.2 Marker Tracking / AR Related

- `A-Frame`
- `AR.js`
- `@ar-js-org/ar.js-threejs`

### 4.3 WebXR / Quest Related

- `three` の `WebXRManager`
- `navigator.xr`
- `immersive-ar`

### 4.4 Build / Runtime Policy

- 開発サーバーは HTTPS 前提
- Quest Browser とスマートフォン実機アクセスを前提
- 静的配信可能な構成
- 各ページはマルチページアプリとしてビルド

## 5. Directory And File Structure

主要ファイルは以下です。

- [package.json](/root/Codex/XR-app/package.json)
- [vite.config.ts](/root/Codex/XR-app/vite.config.ts)
- [index.html](/root/Codex/XR-app/index.html)
- [README.md](/root/Codex/XR-app/README.md)
- [phone-ar.html](/root/Codex/XR-app/phone-ar.html)
- [quest-ar.html](/root/Codex/XR-app/quest-ar.html)
- [immersive-ar.html](/root/Codex/XR-app/immersive-ar.html)
- [immersive-ar-with-maker.html](/root/Codex/XR-app/immersive-ar-with-maker.html)
- [src/shared/content.ts](/root/Codex/XR-app/src/shared/content.ts)
- [src/shared/types.ts](/root/Codex/XR-app/src/shared/types.ts)
- [src/phone-ar/main.ts](/root/Codex/XR-app/src/phone-ar/main.ts)
- [src/quest-ar/main.ts](/root/Codex/XR-app/src/quest-ar/main.ts)
- [src/immersive-ar/main.ts](/root/Codex/XR-app/src/immersive-ar/main.ts)
- [src/immersive-ar-with-marker/main.ts](/root/Codex/XR-app/src/immersive-ar-with-marker/main.ts)

## 6. Shared Design

### 6.1 Shared Content

共通コンテンツ定義は [content.ts](/root/Codex/XR-app/src/shared/content.ts) に集約しています。

現時点では 1 つのデモコンテンツを持ちます。

- `id`
- `title`
- `description`
- `markerAsset`
- `markerKind`
- `position`
- `rotation`
- `scale`

### 6.2 Shared Intent

各ページで表示するオブジェクトは完全に同一ではありませんが、意図としては同じコンテンツを別デバイス・別表示方式で見せる設計です。

## 7. Page Design

## 7.1 Phone-ar

### Purpose

スマートフォン向けの確実な marker AR 実装です。v1 の完成物として扱えるページです。

### Entry

- [phone-ar.html](/root/Codex/XR-app/phone-ar.html)
- [main.ts](/root/Codex/XR-app/src/phone-ar/main.ts)

### Implementation

- `A-Frame + AR.js`
- `Hiro` マーカーを使用
- AR.js が生成するカメラ映像を全画面背景として表示
- 透明な A-Frame キャンバスを前面に重ねる
- マーカー上に 3D オブジェクトを表示
- HUD 上に状態と説明文を表示

### Runtime States

- カメラ準備中
- カメラ起動完了
- マーカー検出中
- マーカー見失い
- カメラエラー

### Outcome

- スマートフォンでは安定して AR 表示が可能
- `Phone-ar` は要件に対する最も完成度の高い Web 実装

## 7.2 Quest-ar

### Purpose

Quest 3 のブラウザ上で marker AR を成立させる検証ページです。これは `immersive-ar` ではなく、video-see-through 型です。

### Entry

- [quest-ar.html](/root/Codex/XR-app/quest-ar.html)
- [main.ts](/root/Codex/XR-app/src/quest-ar/main.ts)

### Implementation

- `@ar-js-org/ar.js-threejs`
- `Hiro` pattern を使用
- カメラ映像を全画面に表示
- three.js キャンバスを前面に描画
- マーカー認識時のみ `markerRoot` を表示
- `navigator.xr` と `immersive-ar` の capability も表示

### Outcome

- Quest Browser 上でも marker AR は成立
- ただし、表示方式は実空間パススルーではなく、ブラウザの camera feed 上へのオーバーレイ

### Design Interpretation

このページは `Quest で marker tracking がどこまで可能か` を確認するための PoC であり、没入型 MR そのものではありません。

## 7.3 Immersive-ar

### Purpose

Quest 3 の `immersive-ar` セッションを使い、パススルー空間に 3D オブジェクトを固定表示する検証ページです。

### Entry

- [immersive-ar.html](/root/Codex/XR-app/immersive-ar.html)
- [main.ts](/root/Codex/XR-app/src/immersive-ar/main.ts)

### Implementation

- `navigator.xr.requestSession("immersive-ar", ...)`
- `three.js` の WebXR 対応レンダラー
- `Start immersive-ar` ボタンでセッション開始
- セッション開始後、視線の正面約 1.5m にオブジェクトを配置
- 描画は `renderer.setAnimationLoop(...)`

### Outcome

- Quest 3 で没入型パススルー AR は成立
- マーカー認識は扱わない

### Design Interpretation

このページは `Quest で immersive-ar が成立するか` を切り分けるための独立検証です。

## 7.4 Immersive-ar-with-maker

### Purpose

marker 認識と immersive-ar の橋渡しを試すページです。

### Entry

- [immersive-ar-with-maker.html](/root/Codex/XR-app/immersive-ar-with-maker.html)
- [main.ts](/root/Codex/XR-app/src/immersive-ar-with-marker/main.ts)

### Design Goal

本来目指したいのは、

- リアルタイムでマーカーを認識
- Quest 3 のパススルー MR 中に
- その場所へオブジェクトを安定表示

です。

ただし、Web 技術のみでこれをそのまま安定実装するのは難しいため、現実的な近似として以下の 2 段階方式を採用しました。

### Current Flow

1. marker stage
   `Hiro` マーカーを認識して、その時点の相対姿勢を取得
2. capture stage
   `Capture marker pose` で姿勢を保存
3. immersive stage
   `Start immersive-ar` で没入型パススルーに入り、保存姿勢を元に前方へ再配置

### Important Constraint

このページは「marker tracking と immersive-ar の完全同時統合」ではありません。

実装上は以下です。

- marker 検出中は camera feed ベースの AR
- immersive 中は WebXR セッション
- 両者の座標系は同一ではない
- 保存した相対位置を没入座標へ近似的に変換している

### Current Outcome

- marker stage の表示は成立
- immersive stage も描画自体は修正済み
- ただし、期待どおりの「リアルタイムかつ正確なマーカー位置再現」ではない
- 挙動は PoC としては成立しているが、製品品質とは言いにくい

## 8. Verification Results

### 8.1 Confirmed Working

- `Phone-ar`
  スマートフォンで marker AR が成立
- `Quest-ar`
  Quest Browser で marker AR が成立
- `Immersive-ar`
  Quest Browser で immersive-ar passthrough が成立

### 8.2 Partially Working

- `Immersive-ar-with-maker`
  marker 検出フェーズは成立
  immersive 遷移も成立
  ただし、マーカー位置の再現は近似であり、理想的な動作には届いていない

## 9. What Was Learned

今回の検証で確認できたことは以下です。

### 9.1 Web でできること

- スマートフォンでの marker AR
- Quest Browser 上での marker AR
- Quest Browser 上での immersive passthrough AR

### 9.2 Web で難しいこと

- Quest 3 のパススルー MR 空間と marker 認識結果を高精度に直結すること
- リアルタイムでマーカーを認識し続けながら immersive-ar 空間に安定配置すること
- WebXR の空間座標と browser-side CV の座標を自然に一致させること

### 9.3 Practical Conclusion

Web 技術だけでも PoC は可能です。ただし、以下の最終目標に対しては難易度が高いです。

- Quest 3
- パススルー MR
- リアルタイム marker recognition
- その場所への安定配置

この要件に対しては、最終的な本命はネイティブ実装です。

## 10. Why Native Is More Suitable

今回の検証を踏まえた判断は以下です。

- Web
  PoC、技術検証、短期デモに向く
- Native
  Quest 3 を主役とした MR 製品実装に向く

特に以下を求める場合、ネイティブの方が現実的です。

- パススルーと CV 処理の統合
- 安定した空間アンカー
- 実環境での運用品質
- マーカー認識や画像認識と MR 空間の一体化

## 11. Suggested Future Architecture

### Option A

スマートフォンは WebAR、Quest はネイティブ MR に分離する。

- スマートフォン
  `Phone-ar` をベースに marker AR を継続
- Quest
  Unity + Meta SDK を本命にする

### Option B

Quest 側で marker を捨て、空間理解ベースにする。

- Web なら `IWSDK + scene understanding`
- Native なら `Unity + Meta XR + anchors / scene understanding`

### Option C

Quest 側も Web だけで続行する。

これは不可能ではありませんが、以下の理由で推奨度は低いです。

- 最後の統合難易度が高い
- 安定性の割に工数が重い
- 実用品質へ届きにくい

## 12. Open Issues

- `Immersive-ar-with-maker` の位置再現精度
- marker 認識と immersive 座標の一致性
- Quest Browser 実装差分への追従
- AR.js-threejs バンドルサイズの大きさ
- WebXR capability と実機挙動の差異

## 13. Current Recommendation

現時点の推奨は以下です。

- この `XR-app` は PoC として維持する
- スマートフォン側は `Phone-ar` をそのまま活用できる
- Quest 3 の本命実装はネイティブへ移行する

## 14. Implementation Notes

### HTTPS

- 開発サーバーは HTTPS で起動する
- Quest Browser / スマートフォン実機アクセス前提

### Multi-page Build

ビルド対象ページは [vite.config.ts](/root/Codex/XR-app/vite.config.ts) の `rollupOptions.input` に追加済みです。

### Shared Assets

AR.js 用アセットは以下です。

- [camera_para.dat](/root/Codex/XR-app/public/assets/arjs/camera_para.dat)
- [patt.hiro](/root/Codex/XR-app/public/assets/arjs/patt.hiro)

## 15. Final Assessment

このプロジェクトの評価は以下です。

- `Phone-ar`
  実用的な Web AR PoC
- `Quest-ar`
  Quest Browser marker AR の成立確認
- `Immersive-ar`
  Quest Browser immersive passthrough の成立確認
- `Immersive-ar-with-maker`
  Web での限界点を明確にするための重要な検証

つまり、このプロジェクトは「そのまま製品にする」よりも、「何が Web でできて、どこからネイティブへ切るべきか」を判断するための検証基盤として価値があります。

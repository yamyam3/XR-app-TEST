# XR-app

ブラウザ向けの MR/AR サブプロジェクトです。`Phone-ar`、`Quest-ar`、`Immersive-ar`、`Immersive-ar-with-maker` の 4 つのページを持ちます。

## Pages

- 動作確認用リンク: https://yamyam3.github.io/XR-app-TEST/

- `/phone-ar.html`
  スマートフォン向け。AR.js の `Hiro` マーカーを使って 3D オブジェクトと短文を表示します。
- `/quest-ar.html`
  Quest 3 向け。`Hiro` マーカーを読み、video-see-through 型で 3D オブジェクトを重ねます。
- `/immersive-ar.html`
  Quest 3 向け。WebXR `immersive-ar` セッションでパススルー空間に 3D オブジェクトを固定表示します。
- `/immersive-ar-with-maker.html`
  Quest 3 向け。`Hiro` マーカーを検出して位置を保存してから、WebXR `immersive-ar` セッションへ入り、保存した相対位置を元にオブジェクトを再配置します。

## Hiro Marker

検証用の `Hiro` マーカー画像を同梱しています。

- [hiro-marker.png](/root/Codex/XR-app/public/assets/hiro-marker.png)

画面表示または印刷して、`Phone-ar`、`Quest-ar`、`Immersive-ar-with-maker` の検証に利用できます。

## Run

```bash
npm install
npm run dev
```

LAN 内の他端末からは `https://<your-ip>:5173/phone-ar.html`、`https://<your-ip>:5173/quest-ar.html`、`https://<your-ip>:5173/immersive-ar.html`、`https://<your-ip>:5173/immersive-ar-with-maker.html` にアクセスします。

初回は自己署名証明書になるため、端末側で警告を許可して開いてください。

## Notes

- `Phone-ar` は外部 CDN から `A-Frame 1.6.0` と `AR.js 3.4.7` を読み込みます。
- `Quest-ar` は marker tracking 優先、`Immersive-ar` は没入型表示優先のため、目的が異なります。
- `Immersive-ar-with-maker` は marker tracking と immersive-ar を同時に統合したものではなく、先にマーカー姿勢を保存してから没入型へ遷移する近似方式です。
- 開発サーバーと `vite preview` はどちらも HTTPS で起動します。
- 実機で WebXR を使う場合は `HTTPS` 配信が必要です。

## GitHub Publication Notes

- `.gitignore` で `node_modules/` と `dist/` は除外します。
- このリポジトリには API キーやシークレットは含めていません。
- 利用ライブラリと外部 CDN については [THIRD_PARTY_NOTICES.md](/root/Codex/XR-app/THIRD_PARTY_NOTICES.md) を参照してください。
- `Phone-ar` の外部 CDN 依存を避けたい場合は、公開前に `A-Frame` と `AR.js` をローカル同梱へ切り替えてください。

## GitHub Pages

このプロジェクトは GitHub Pages にデプロイできます。

公開先:

- `https://yamyam3.github.io/XR-app-TEST/`

- `.github/workflows/deploy-pages.yml` を追加済みです。
- GitHub Actions 上では Vite の `base` を自動的にリポジトリ名へ合わせます。
- 現在の想定公開 URL は `https://yamyam3.github.io/XR-app-TEST/` です。

有効化手順:

1. GitHub リポジトリの `Settings > Pages` を開く
2. `Source` を `GitHub Actions` にする
3. `main` ブランチへ push する

公開後の代表 URL:

- `https://yamyam3.github.io/XR-app-TEST/`
- `https://yamyam3.github.io/XR-app-TEST/phone-ar.html`
- `https://yamyam3.github.io/XR-app-TEST/quest-ar.html`
- `https://yamyam3.github.io/XR-app-TEST/immersive-ar.html`
- `https://yamyam3.github.io/XR-app-TEST/immersive-ar-with-maker.html`

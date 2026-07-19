# Thermoelectric Calculator

導電率、熱伝導率、ゼーベック係数、温度から、熱電材料のパワーファクターと無次元性能指数ZTを端末内で計算するスマートフォン向けPWAです。

## 機能

- 入力変更ごとの自動計算
- 温度、ゼーベック係数、電気伝導率の単位変換
- PFを `W/(m·K²)`、`mW/(m·K²)`、`µW/(cm·K²)` で表示
- ZTとキャリア型（p-type / n-type / undetermined）を表示
- 不正入力の日本語エラー表示
- 結果のクリップボードコピー
- 入力値と単位のlocalStorage保存
- オフライン動作、ホーム画面追加、ダークモード対応

## ローカルでの起動方法

```bash
npm install
npm run dev
```

表示されたローカルURLをAndroid ChromeまたはiPhone Safariで開いてください。同じWi-Fi内のスマートフォンから確認する場合は、Viteが表示するNetwork URLを使います。

## 確認コマンド

```bash
npm run lint
npm run test
npm run build
```

## Android Chromeでホーム画面へ追加

1. ChromeでアプリのURLを開く
2. 右上のメニューを開く
3. 「ホーム画面に追加」または「アプリをインストール」を選ぶ
4. 名前を確認して追加する

## iPhone Safariでホーム画面へ追加

1. SafariでアプリのURLを開く
2. 共有ボタンをタップする
3. 「ホーム画面に追加」を選ぶ
4. 名前を確認して追加する

## GitHub Pagesへの無料公開方法

このプロジェクトはViteで作っているため、公開時には `npm run build` または `pnpm run build` で `dist` フォルダを作り、その `dist` をGitHub Pagesへ公開します。GitHub Pagesは静的サイトを公開する仕組みなので、このアプリのようにバックエンドやデータベースを使わないPWAに向いています。

このリポジトリには `.github/workflows/deploy.yml` を用意してあります。GitHubへpushすると、GitHub Actionsが自動でテスト、ビルド、公開まで行います。

### 1. GitHubアカウントを作成する

GitHubアカウントがなければ、https://github.com/ で無料アカウントを作成します。

### 2. 新しいリポジトリを作成する

1. GitHub右上の `+` を押す
2. `New repository` を選ぶ
3. Repository name に好きな名前を入力する
   - 例: `thermoelectric-calculator`
4. 無料公開したい場合は `Public` を選ぶ
5. `Create repository` を押す

無料プランでは、PublicリポジトリならGitHub PagesとGitHub Actionsを無料で使いやすいです。

### 3. このプロジェクトをGitHubへpushする

初回だけ、ローカルのプロジェクトとGitHubリポジトリをつなぎます。`<YOUR_NAME>` と `<REPOSITORY_NAME>` は自分のGitHubユーザー名とリポジトリ名に置き換えてください。

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<YOUR_NAME>/<REPOSITORY_NAME>.git
git push -u origin main
```

すでにgit管理している場合は、`git init` は不要です。

### 4. GitHub Pagesの公開元をGitHub Actionsにする

1. GitHubでリポジトリを開く
2. 上部メニューの `Settings` を開く
3. 左メニューの `Pages` を開く
4. `Build and deployment` の `Source` で `GitHub Actions` を選ぶ

### 5. GitHub Actionsの完了を待つ

`main` ブランチへpushすると、`.github/workflows/deploy.yml` が動きます。

1. リポジトリ上部の `Actions` を開く
2. `Deploy to GitHub Pages` を選ぶ
3. 緑のチェックマークになれば成功
4. `Settings` → `Pages` に表示されるURLを開く

公開URLは通常、次のような形です。

```text
https://<YOUR_NAME>.github.io/<REPOSITORY_NAME>/
```

初回公開や更新の反映には数分かかることがあります。

### 6. 更新するとき

ファイルを変更したら、以下の流れでGitHubに送ります。

```bash
git add .
git commit -m "Update app"
git push
```

pushするたびにGitHub Actionsが自動で再公開します。

### よくあるつまずき

- `Actions` が赤い場合: 失敗した行を開き、`lint`、`test`、`build` のどこで落ちたか確認します。
- ページが404になる場合: `Settings` → `Pages` のSourceが `GitHub Actions` になっているか確認します。
- 古い画面が出る場合: 数分待ってから再読み込みします。PWAはキャッシュが効くため、ブラウザの再読み込みやホーム画面アイコンの再追加が必要な場合があります。
- URLのパスで崩れる場合: `vite.config.ts` の `base` を `'/<REPOSITORY_NAME>/'` に変更して再pushします。このプロジェクトは `base: './'` なので通常はサブパスでも動きます。

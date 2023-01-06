//HTML要素取得
const canvas = document.getElementById('canvas'); 

//2D描画用のオブジェクト(コンテキスト)を呼び出し
const ctx = canvas.getContext('2d');  

/* 画像描画の確認用 */
/* 
//ctx.fillStyle = 'red';  //塗りつぶしの色を設定(ここでは赤)
// ctx.fillRect(30, 20, 150, 100);  //四角形を描画、引数は順に、四角形左上頂点のx座標、四角形左上頂点のy座標、横幅、縦幅

//img要素を作成
const dinoImage = new Image();

//使用する画像のパスを指定
dinoImage.src = `image/dino.png`;  

//画像の描画
//ctx.drawImage(イメージオブジェクト, 画像の左上先のx座標, 画像の左上先のy座標) で画像を描画
dinoImage.onload = () => {
  ctx.drawImage(dinoImage, 0, 320);
}; 
*/

//使用する画像の名前を配列で保管
const imageNames = ['bird', 'cactus', 'dino'];

//ゲームに使用するデータや画像データなどをいれておくオブジェクト
//各値は、ゲームの進行によって随時更新される
//グローバルに使えるよう、グローバルな位置で宣言
const game = {
  counter: 0,  //ゲーム開始から何フレーム目かを数えておくための数値
  enemies: [],  //フィールドに配置されている敵キャラクタを入れておく配列
  image: {},  //ゲームに使用する画像ータを入れておくオブジェクト
  isGameOver: true,  //ゲーム中かどうかを判断する真偽値
  score: 0,  //ゲームの点数
  timer: null  //ゲームのフレーム切り替えを管理するタイマー
};

//ゲームで使用する画像を読み込んでいく
//画像を全て読み込んだら、ゲームの初期化用関数を呼び出す
let imageLoadCounter = 0;
for (const imageName of imageNames){
  const imagePath = `image/${imageName}.png`;
  game.image[imageName] = new Image();
  game.image[imageName].src = imagePath;
  game.image[imageName].onload = () => {
    imageLoadCounter += 1;
    if(imageLoadCounter === imageNames.length){
      console.log('画像のロードが完了しました。');

      //ゲームの初期化用関数呼び出し
      init();
    }
  }
};

//ゲームの初期化用関数
function init(){
  game.counter    = 0;
  game.enemies    = [];
  game.isGameOver = false;
  game.score      = 0;
};


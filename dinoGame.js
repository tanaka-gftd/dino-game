/* 
  注意！

  canvasタグでは一番左上が原点となるので、右に行くほどx座標の値が増え、下に行くほどy座標の値が増えるようになっている
  （y座標の値の増減が、数学の座標と反対になっている）
*/


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
//ctx.drawImage(イメージオブジェクト, 左方向にずらしたい距離, 下方向にずらしたい距離) で画像を描画
//ctx.drawImageでは第2引数の値を増やすと左方向にずれ、第3引数の値を増やすと下方向にずれるので、数学の座標とはy軸方向の指定が異なる点に注意
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
  image: {},  //ゲームに使用する画像データを入れておくオブジェクト
  isGameOver: true,  //ゲーム中かどうかを判断する真偽値
  score: 0,  //ゲームの点数
  timer: null  //ゲームのフレーム切り替えを管理するタイマー
};


//ゲームで使用する画像を読み込んでいく
//配列に格納された文字列を元に、画像のPathを作成していく
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
  createDino();  //恐竜の初期位置や移動速度などを設定する、createDino関数を呼び出す
  game.timer = setInterval(ticker, 30);  //30m秒ごとに、ticker関数を呼び出す(パラパラ漫画のようにしてアニメーションを実現)
};


//恐竜の移動や敵の生成
//パラパラ漫画のようにするため、本関数は何度も呼び出される
function ticker(){

  //パラパラ漫画のようにするため、一旦画面の中身をクリア
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // TODO 敵キャラクタの生成

  //恐竜の移動
  moveDino();

  //恐竜の描画
  drawDino();

  // TODO 当たり判定処理

  //カウンタの更新
  //カウンタの数は1ずつ増やし、カウント数が1000000まで行ったら、再び0からカウントするようにする(値が大きくなりすぎるのを防ぐ)
  game.counter = (game.counter + 1) % 1000000;
};


//恐竜の表示位置や移動速度などのデータを持つオブジェクトを設定する関数
function createDino(){
  game.dino = {
    x: game.image.dino.width / 2,  //画面の一番左から、恐竜の画像中心までの距離。 初期位置はゲーム画面の左端(左端から動かない)
    y: canvas.height - game.image.dino.height / 2,  //ゲーム画面の上端から恐竜の画像中心までの距離。 初期位置はゲーム画面の下端
    moveY: 0,  //恐竜のy軸方向の移動速度、つまりジャンプ速度(数学のy座標とは正負の向きが異なる点に注意！ プラスで下方向、マイナスで上方向)
    width: game.image.dino.width,  //恐竜の画像の横幅の数値
    height: game.image.dino.height,  //恐竜の画像の縦幅の数値
    image: game.image.dino  //恐竜の画像オブジェクト
  }
};


//恐竜の移動
//恐竜の移動は上下方向のみ(ジャンプのみ)
function moveDino(){

  //画像を移動
  /* 
    ジャンプの際は、30m秒毎に行われる描画の度にgame.dino.moveYの値が更新され、
    結果、game.dino.y(恐竜の画像の縦方向の中心位置)が30m秒毎に上下方向に移動する
  */
  game.dino.y += game.dino.moveY;

  
  /* 
    'game.dino.y (ゲーム画面の上端から恐竜の画像中心までの距離)' と 'canvas.height - game.dino.height / 2 (恐竜の初期位置)' を比較

    'game.dino.y' と 'canvas.height - game.dino.height / 2' が同じ → 恐竜は初期位置と同じ位置にいる
    'game.dino.y' と 'canvas.height - game.dino.height / 2' で前者が大きい → 恐竜が初期位置より下にいる。初期位置より下はないので、初期位置になるよう修正
    'game.dino.y' と 'canvas.height - game.dino.height / 2' で後者が大きい → 恐竜が初期位置より上にいるので、ジャンプ中なのでelse文へ
  */
  if(game.dino.y >= canvas.height - game.dino.height / 2){

    //恐竜を初期位置に置き、恐竜のジャンプ速度も0にする(静止状態にする)
    game.dino.y = canvas.height - game.dino.height / 2;
    game.dino.moveY = 0;  
  } else {

    //描画毎にズレる距離が+3していく(ここでの+は下方向であることを忘れないように！)
    /* 
      ジャンプの初速度は下記で設定してある通り、最初の描画で画像が-41移動、すなわち上方向に41移動し、
      順に画像が上方向にズレる距離が38,35,32,29...となっていき、0を下回り正負が逆転したら、今度は下方向に移動していく
    */
    game.dino.moveY += 3;  //値を減らすとジャンプ速度の減り方がゆっくりになるので、高くのんびりと飛ぶようになる。値を増やせばその逆となる
  }
};


//恐竜の描画
/* 
  ctx.drawImageで指定した座標は画像の左上になる事に注意。
  恐竜の座標は中心の座標なので、画像の横幅半分と高さの半分を左上にずらす必要がある。
  画像の左上を(0,0)とすると、画像の中央は(画像の横幅の半分、画像の縦幅の半分)となっているので、
  それぞれマイナスしておく。

  ctx.drawImageでは第2引数の値を増やすと左方向にずれ、第3引数の値を増やすと下方向にずれるので、
  数学の座標とはy軸方向の指定が異なる点に注意
*/
function drawDino(){
  ctx.drawImage(game.image.dino, game.dino.x - game.dino.width / 2, game.dino.y - game.dino.height / 2);
}


//キー入力でジャンプするようにする
document.onkeydown = function(e) {
  //スペースキーが入力されて、かつ、恐竜が下端にいたらジャンプ(ジャンプ中にジャンプができないようにする)
  if(e.key === ' ' && game.dino.moveY === 0){
    game.dino.moveY = -41;  //ジャンプの初速度(負数なのでジャンプの向きは上方向、数値が低いほどジャンプ力が増す)
  }
};

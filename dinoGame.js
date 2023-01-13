/* 
  注意！

  canvasタグでは一番左上が原点となるので、右に行くほどx座標の値が増え、下に行くほどy座標の値が増えるようになっている
  （y座標の値の増減が、数学の座標と反対になっている）
*/

/* 
  全般

  画像の位置の基準は、画像の中央部分となっている。
  なので画像の座標を設定する際は、'width / 2' や 'height / 2' を加減させることが多い

*/


//HTML要素取得
const canvas = document.getElementById('canvas'); 

//2D描画用のオブジェクト(コンテキスト)を呼び出し
const ctx = canvas.getContext('2d');  

/* 画像描画の確認用 */
/* ctxの学習用として残しておく */
/* 
//ctx.fillStyle = 'red';  //塗りつぶしの色を設定(ここでは赤)
// ctx.fillRect(30, 20, 150, 100);  //四角形を描画、引数は順に、四角形左上頂点のx座標、四角形左上頂点のy座標、横幅、縦幅

//img要素を作成
const dinoImage = new Image();

//使用する画像のパスを指定
dinoImage.src = `./image/dino.png`;  

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
  enemyCountdown: 0,  //敵の出現までの残りカウント
  enemies: [],  //フィールドに配置されている敵キャラクタを入れておく配列
  backGrounds: [],  //背景を扱う配列
  clouds: [],  //雲を扱う配列
  image: {},  //ゲームに使用する画像データを入れておくオブジェクト
  //isGameOver: true,  //ゲーム中かどうかを判断する真偽値 → stateに扱うようにした
  state: 'loading',  //ゲームの状態を管理する変数
  score: 0,  //ゲームの点数
  HighScore: 500,  //ハイスコアの初期値（ハイスコアの値はゲームを再チャレンジしても保持される）
  timer: null,  //ゲームのフレーム切り替えを管理するタイマー
  bgm1: new Audio('./bgm/fieldSong.mp3'),  //ゲーム中のBGM
  bgm2: new Audio('./bgm/jump.mp3')  //ジャンプ音
};

//BGMのループ再生ON
game.bgm1.loop = true;

//ゲームで使用する画像を読み込んでいく
//配列に格納された文字列を元に、画像のPathを作成していく
//画像を全て読み込んだら、ゲームの初期化用関数を呼び出す
let imageLoadCounter = 0;
for (const imageName of imageNames){
  const imagePath = `./image/${imageName}.png`;
  game.image[imageName] = new Image();
  game.image[imageName].src = imagePath;

  //画像を読み込んだら実行
  game.image[imageName].onload = () => {
    imageLoadCounter += 1;
    if(imageLoadCounter === imageNames.length){  //全ての画像を読み込んだか確認
      console.log('画像のロードが完了しました。');

      //ゲームの初期化用関数呼び出し
      init();
    };
  };
};


//ゲームの初期化用関数
/* 
  元々本関数は値の初期化を行う関数だったが、
  BGM導入後は、ゲーム開始時に音楽が流れるようにするため、
  init()は待機画面を描画する関数に仕様を変更した。
*/
function init(){
  game.counter    = 0;
  game.enemies    = [];
  //game.isGameOver = false;  //状態はgame.stateで扱うので削除
  game.score      = 0;
  
  //game.timer = setInterval(ticker, 30);  //30m秒ごとに、ticker関数を呼び出す(パラパラ漫画のようにしてアニメーションを実現)
  game.enemyCountdown = 0;
  game.state = 'init';  //待機画面の状態

  //以下、待機画面の描画
  //待機画面の時点で、背景、雲、恐竜、空、ハイスコアなどを描画しておく
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  createBackGround();
  createClouds();
  createDino();
  drawSky();
  drawBackGrounds();
  drawClouds(); 
  drawDino();
  drawScore();  //待機画面中は表示されるのはハイスコアのみ
  ctx.fillStyle = 'black';
  ctx.font = 'bold 60px serif';
  ctx.fillText('Press Space key', 150, 150);
  ctx.fillText('to start', 280, 230);
};


//ゲームを開始する関数
function start(){
  game.state = 'gaming';  //ゲーム中を表す状態
  game.bgm1.play();  //BGMを鳴らす
  game.timer = setInterval(ticker, 30);  //ticker関数を30m秒毎に呼び出し、ゲームの描画をパラパラ漫画のように更新していく
};


//恐竜の移動や敵の生成
//パラパラ漫画のようにするため、本関数は何度も呼び出される
function ticker(){

  //パラパラ漫画のようにするため、本関数実行の度に一旦画面の中身をクリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //背景の作成(ticker関数が20回呼ばれる毎に背景を作成する)
  if(game.counter % 20 === 0){
    createBackGround();
  };

  //雲の作成(ticker関数が20回呼ばれる毎に雲を作成する)
  if(game.counter % 20 === 0){
    createClouds();
  };

  //敵キャラの作成
  createEnemies();

  //移動
  moveBackGrounds();  //背景の移動
  moveClouds();  //雲の移動
  moveDino();  //恐竜の移動
  moveEnemies();  //敵キャラの移動

  //描画
  drawSky();  //空の描画
  drawBackGrounds();  //背景の描画
  drawClouds();  //雲の描画
  drawDino();  //恐竜の描画
  drawEnemies();  //敵キャラの描画
  drawScore();  //スコアの表示

  //当たり判定処理
  hitCheck();

  //本関数が呼ばれるたびにスコア加算
  game.score += 1;

  //カウンタの更新
  //カウンタの数は1ずつ増やし、カウント数が1000000まで行ったら、再び0からカウントするようにする(値が大きくなりすぎるのを防ぐ)
  game.counter = (game.counter + 1) % 1000000;

  //ticker関数が呼ばれる毎に、敵出現までの残りカウントを1つ減らす
  game.enemyCountdown -= 1;
};


//恐竜の表示位置や移動速度などのデータを持つオブジェクトを設定する関数
function createDino(){
  game.dino = {
    x: game.image.dino.width / 2 + 10,  //画面の一番左から、恐竜の画像中心までの距離。 初期位置はゲーム画面の左端からちょっとだけ右に配置(※恐竜は横移動しない)
    y: canvas.height - game.image.dino.height / 2,  //ゲーム画面の上端から恐竜の画像中心までの距離。 初期位置はゲーム画面の下端
    moveY: 0,  //恐竜のy軸方向の移動速度、つまりジャンプ速度(数学のy座標とは正負の向きが異なる点に注意！ プラスで下方向、マイナスで上方向)
    width: game.image.dino.width,  //恐竜の画像の横幅の数値
    height: game.image.dino.height,  //恐竜の画像の縦幅の数値
    image: game.image.dino  //恐竜の画像オブジェクト
  }
};


//敵サボテンの作成
//敵サボテンは画面下段で出現し、右端から左方向に移動する
function createCactus(createX){  
  game.enemies.push({
    //x: canvas.width + game.image.cactus.width / 2,  //初期位置、すなわち出現位置は画面右端 
    x: createX,  /* 1行上書き換え、サボテンの出現x座標を直接指定するのではなく、本関数呼び出し時に引数として渡すようにする */
    y: canvas.height - game.image.cactus.height / 2,  //画面下端
    width: game.image.cactus.width,
    height: game.image.cactus.height,
    moveX: -10,  //移動速度（マイナスなので左方向に移動）
    image: game.image.cactus
  });
};


//敵バードの生成
//敵バードはランダムな高さで出現し、右端から左方向に移動する
function createBird(){
  const birdY = Math.random() * (300 - game.image.bird.height) + 150;  //ランダムな高さを指定
  game.enemies.push({
    x: canvas.width + game.image.bird.width / 2,  //初期位置、すなわち出現位置は画面右端
    y: birdY,
    width: game.image.bird.width,
    height: game.image.bird.height,
    moveX: -15,   //移動速度（マイナスなので左方向に移動）
    image: game.image.bird
  });
};


//敵キャラを出現させる
function createEnemies(){

  //敵出現の残りカウント0で、以下の処理を行う
  if(game.enemyCountdown === 0){

    //敵出現の残りカウントを増やす
    //増やすカウントは、点数が高くなるほど少ない値にする（=高スコアほど、再出現の間隔が狭まる）
    //ただし、30未満の値は設定されないようにする
    game.enemyCountdown = 60 - Math.floor(game.score / 100);
    if(game.enemyCountdown <= 30) game.enemyCountdown = 30;

    //乱数を用いて、敵の出現パターンを3つ用意
    switch(Math.floor(Math.random() * 3)){
      case 0:
        createCactus(canvas.width + game.image.cactus.width / 2);
        break;
      case 1:
        createCactus(canvas.width + game.image.cactus.width / 2);
        createCactus(canvas.width + game.image.cactus.width * 3 / 2);
        break;
      case 2:
        createBird();
        break;
    };
  };
};


//背景を作成する関数
//背景の部品は1つあたり横幅200pxで、for文を使って画面横いっぱいに埋め尽くす
//ticker関数20回毎にcreateBackGround関数が呼ばれるので、'背景の横幅 / 背景の移動速度(の絶対値)' が20になるように設定するとgood
//（正確には '背景の横幅 * 背景の移動速度(の絶対値)' の頻度で本関数が実行されるようにticker関数を設定する、の方が正しいかも）
function createBackGround(){
  game.backGrounds = [];  //呼ばれる度に背景が保存されている配列の中身をクリア
  for(let x = 0; x <= canvas.width; x += 200){  //背景の横幅は200pxなので、+=200する
    game.backGrounds.push({
      x: x,
      y: canvas.height,  //画面上端から、背景の下端までの距離
      width: 200,  //背景の横幅
      moveX: -10  //背景の移動速度
    });
  };
};


//雲を作成する関数
//実装方法は、背景を作成する関数と基本的に一緒
function createClouds(){
  game.clouds = [];
  for(let x = 0; x <=canvas.width; x  += 200){
    game.clouds.push({
      x: x,
      y: canvas.height,
      width: 200,
      moveX: -10
    });
  };
};


//背景移動用の関数
//本関数が呼ばれる度に背景の表示位置を更新
function moveBackGrounds(){
  for(const backGround of game.backGrounds){
    backGround.x += backGround.moveX;
  };
};


//雲移動用の関数
//本関数が呼ばれる度に雲の表示位置を更新
function moveClouds(){
  for(const cloud of game.clouds){
    cloud.x += cloud.moveX;
  };
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

    //描画毎にズレる距離が+3していく
    //ここでの+は下方向、よって上方向への移動速度はだんだん遅くなり、ジャンプの頂点(=移動速度が0となる点)に到達した後は落下していく
    /* 
      ジャンプの初速度は下記で設定してある通り、最初の描画で画像が-41移動、すなわち上方向に41移動し、
      順に画像が上方向にズレる距離が38,35,32,29...となっていき、0を下回り正負が逆転したら、今度は下方向に移動していく
    */
    game.dino.moveY += 3;  //値を減らすとジャンプ速度の減り方がゆっくりになるので、高くのんびりと飛ぶようになる。値を増やせばその逆となる
  };
};


//敵キャラの移動、画面の外に出た敵キャラは削除
function moveEnemies(){

  //敵キャラの移動
  for(const enemy of game.enemies){
    enemy.x += enemy.moveX;
  };

  //画面の外に出た敵キャラを、配列から削除
  //ここでのxは、画面右端からの距離。
  //敵キャラクタのx座標が画像の横幅分を超えて外にでたら削除したいので、まだ外にはみ出てない物だけを残す
  game.enemies = game.enemies.filter(enemy => enemy.x > - enemy.width);
};


//空の描画
function drawSky(){
  ctx.fillStyle = 'rgb(143, 203, 250)';  //空の色。水色風味(他の箇所の文字色も変わってしまうので、それらは個別に修正しておく)
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};


//背景の描画
function drawBackGrounds(){

  ctx.fillStyle = 'sienna';  //背景の色。siennaは茶色風味(他の箇所の文字色も変わってしまうので、それらは個別に修正しておく)

  //配列backGroundsの要素をもとに背景を設定
  for(const backGround of game.backGrounds){

    //背景は4段にする
    //ctx.fillRectに渡す引数は4つ。最初の2つは初期位置(左端からの距離、上端からの距離)、3番目はオブジェクトの横幅、4番目はオブジェクトの縦幅
    ctx.fillRect(backGround.x, backGround.y - 10, backGround.width, 10);  //上から4段目
    ctx.fillRect(backGround.x + 20, backGround.y - 20, backGround.width - 40, 10);  //上から3段目
    ctx.fillRect(backGround.x + 50, backGround.y - 30, backGround.width - 100, 10);  //上から2段目
    ctx.fillRect(backGround.x + 75, backGround.y - 40, backGround.width - 150, 10);  //1番上の段
  };
};


//雲の描画
//実装方法は、背景を描画する関数と基本的に一緒
//雲は3段にする
function drawClouds(){
  ctx.fillStyle = 'white';
  for(const cloud of game.clouds){
    ctx.fillRect(cloud.x + 25, cloud.y - 380, cloud.width - 130, 10);
    ctx.fillRect(cloud.x +  0, cloud.y - 370, cloud.width - 80, 30);
    ctx.fillRect(cloud.x + 25, cloud.y - 340, cloud.width - 130, 10);
  };
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
};


//各敵キャラを描画
function drawEnemies(){

  //敵キャラの情報が格納された配列enemiesから各要素を取り出して描画していく
  for(const enemy of game.enemies){
    ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
  };
};


//当たり判定処理
//恐竜が敵キャラに当たっていたらゲームオーバー
function hitCheck(){

  //恐竜に当たったかどうかを全ての敵キャラで判定するので、for文でループ
  for(const enemy of game.enemies){
    if(
      //恐竜と敵キャラが当たったかチェック
      //恐竜と敵キャラの当たり判定も、ここで指定する
      Math.abs(game.dino.x - enemy.x) < game.dino.width * 0.5 / 2 + enemy.width * 0.9 / 2 &&
      Math.abs(game.dino.y - enemy.y) < game.dino.height * 0.5 / 2 + enemy.height * 0.9 / 2
    ) {
      //game.isGameOver = true;  //ゲームオーバーのフラグをON  //ゲームオーバーもgame.stateに統合
      game.state = 'gameover';  //ゲームオーバーを表す状態
      game.bgm1.pause();  //ゲームBGM停止
      ctx.font = 'bold 100px serif';  ////ctx.font...文字の大きさや太さ、書体を設定
      ctx.fillStyle = 'black';  //黒に戻しておく
      ctx.fillText(`Game Over!`, 100, 200);  //ctx.fillText(文章, x, y)...文章を、一番左上から右方向にx、下方向にyの位置に表示
      clearInterval(game.timer);  //clearInterval()...以前に setInterval() の呼び出しによって確立されたタイマーを利用した繰り返し動作を取り消す
      if(game.score >= game.HighScore) {
        game.HighScore = game.score;  //スコアがハイスコアよりも高ければ、ハイスコアも更新
        ctx.font = '24px serif';
        ctx.fillStyle = 'green'; 
        ctx.fillText(`new record!!`, 500, 250);
      };
    };
  };
};


//スコアの描画
function drawScore(){
  ctx.font = '24px serif';
  ctx.fillStyle = 'black';  //黒に戻しておく

  //ゲーム中はスコアとハイスコアを表示、待機画面中はハイスコアのみ表示する
  if(game.state === 'gaming'){
    ctx.fillText(`Score: ${game.score}`, 50, 30);
    ctx.fillText(`Hi-Score: ${game.HighScore}`, 300, 30);
  } else if (game.state === 'init'){
    ctx.fillText(`Hi-Score: ${game.HighScore}`, 300, 30);
  };
};


//キー入力の処理
//ゲームの状態をstateで管理することで、スペースキーのみでの操作を実現
document.onkeydown = function(e) {

  //待機画面でスペースキーを押すと、ゲーム開始
  if(e.key === ' ' && game.state === 'init'){
    start();
  };

  //スペースキーが入力されて、かつ、恐竜が下端にいたらジャンプ(ジャンプ中にジャンプができないようにする)
  //仕様変更により、ジャンプ実行の条件にゲーム実行中であることも加えた
  if(e.key === ' ' && game.dino.moveY === 0 && game.state === 'gaming'){
    game.dino.moveY = -41;  //ジャンプの初速度(負数なのでジャンプの向きは上方向、数値が低いほどジャンプ力が増す)
    game.bgm2.play();  //ジャンプ音再生
  };

  //ゲームオーバー時は、スペースーキーで待機画面へ移行できる
  if(e.key === ' ' && game.state === 'gameover'){
    init();
  };
};

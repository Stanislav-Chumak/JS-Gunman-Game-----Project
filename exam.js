var gunmanGame = {
    game : document.querySelector('.game'),
    menu : document.querySelector('.menu'),
    startButton : document.querySelector('.menu-start'),
    levelButton : document.querySelector('.game-next-level'),
    UIScore : document.querySelector('.score'),
    UILimit : document.querySelector('.header-limit'),
    UITimer : document.querySelector('.header-timer'),
    UILevel : document.querySelector('.game-level'),
    gameStatus : document.querySelector('.game-status'),
    enemy : document.querySelector('.enemy'),
    canFire : false,
    fault : false,
    level : 0,
    limit : 0,
    score : 0,
    levelBonus : 0,
    hit : new CustomEvent('hit'),
    randomEnemy : Math.round(1 + Math.random() * 4),
    soundDeath : new Audio('sounds/death.m4a'),
    soundFire : new Audio('sounds/fire.m4a'),
    soundFault : new Audio('sounds/foul.m4a'),
    soundIntro : new Audio('sounds/intro.m4a'),
    soundShot : new Audio('sounds/shot.m4a'),
    soundWait : new Audio('sounds/wait.m4a'),
    soundWin : new Audio('sounds/win.m4a'),

    init : function () {
        gunmanGame.startButton.addEventListener('click', gunmanGame.startGame);
        gunmanGame.enemy.addEventListener('transitionend', gunmanGame.startDuel);
        gunmanGame.enemy.addEventListener('hit', gunmanGame.gunmanHit);
    },

    startGame : function() {
        gunmanGame.gameStatus.classList.remove('game-status-show');
        gunmanGame.enemy.classList.remove('enemy-' + gunmanGame.randomEnemy);
        gunmanGame.level = 1;
        gunmanGame.limit = 1000;
        gunmanGame.score = 0;
        gunmanGame.menu.classList.add('menu-hide');
        gunmanGame.enemy.addEventListener('mousedown', gunmanGame.playerHit);
        gunmanGame.enemy.classList.add('enemy-' + gunmanGame.randomEnemy);
        gunmanGame.showUI();
        gunmanGame.clearAnimation();
        gunmanGame.enemyMove();
    },

    enemyMove : function() {
        gunmanGame.enemy.style.left = '';
        if(gunmanGame.enemy.classList.contains('enemy-move')) {
            gunmanGame.enemy.classList.remove('enemy-move');
        }
        setTimeout(function() {
            gunmanGame.enemy.classList.add('enemy-move');
            gunmanGame.enemyWalk();
            gunmanGame.soundIntro.play();
        }, 50);
    },

    startDuel : function() {
        gunmanGame.soundIntro.pause();
        gunmanGame.soundIntro.currentTime = 0;
        gunmanGame.enemyStay();
        gunmanGame.soundWait.play();
        setTimeout(function() {
            if(!gunmanGame.fault) {
                gunmanGame.gameStatus.textContent = 'FIRE!';
                gunmanGame.gameStatus.classList.add('game-status-show');
                gunmanGame.canFire = true;
                gunmanGame.enemyReady();
                gunmanGame.soundFire.play();
                gunmanGame.countdown(new Date().getTime());
                setTimeout(gunmanGame.gunmanHit, gunmanGame.limit);
            }
        }, 1100);
    },

    countdown : function(time) {
        var currTime;
        function timer() {
            currTime = new Date().getTime();
            if(gunmanGame.canFire) { // stop time when player or gunman hits
                gunmanGame.levelBonus = ((currTime - time)/1000).toFixed(2);
                gunmanGame.UITimer.textContent = 'You: ' + gunmanGame.levelBonus;
                setTimeout(timer, 10);
            }
        }
        timer();
    },

    playerHit : function() {
        if(gunmanGame.canFire) {
            gunmanGame.enemy.removeEventListener('mousedown', gunmanGame.playerHit);
            gunmanGame.canFire = false;
            gunmanGame.soundShot.play();
            gunmanGame.enemyDown();
            setTimeout(gunmanGame.enemyDead, 2000);
            gunmanGame.score = (+gunmanGame.score + (gunmanGame.limit/1000 - gunmanGame.levelBonus) * gunmanGame.level * 1000).toFixed(0);
            gunmanGame.gameStatus.textContent = 'You won!';
            gunmanGame.UIScore.textContent = gunmanGame.score;
            setTimeout(function() {
                gunmanGame.soundWin.play();
            }, 1000);
            setTimeout(function() {
                gunmanGame.levelButton.addEventListener('click', gunmanGame.nextLevel);
                gunmanGame.levelButton.classList.add('game-next-level-show');
            }, 2000);
        }
        else {
            gunmanGame.fault = true;
            gunmanGame.soundIntro.pause();
            gunmanGame.soundIntro.currentTime = 0;
            gunmanGame.soundShot.play();
            var left = gunmanGame.enemy.offsetLeft;
            gunmanGame.enemy.classList.remove('enemy-move');
            gunmanGame.enemy.style.left = left + 'px';
            gunmanGame.clearAnimation();
            gunmanGame.enemy.removeEventListener('mousedown', gunmanGame.playerHit);
            gunmanGame.enemy.removeEventListener('transitionend', gunmanGame.startDuel);
            gunmanGame.gameStatus.textContent = 'Fault!';
            gunmanGame.gameStatus.classList.add('game-status-show');
            gunmanGame.score = (+gunmanGame.score - 500).toFixed(0);
            if(gunmanGame.score < 0) gunmanGame.score = 0;
            setTimeout(function() {
                gunmanGame.soundFault.play();
            }, 1000);
            setTimeout(gunmanGame.restartLevel, 2000);
        }
    },

    gunmanHit : function() {
        if(gunmanGame.canFire) {
            gunmanGame.canFire = false;
            gunmanGame.soundShot.play();
            gunmanGame.enemy.removeEventListener('mousedown', gunmanGame.playerHit);
            gunmanGame.enemy.dispatchEvent(gunmanGame.hit);
            gunmanGame.enemyHit();
            gunmanGame.gameStatus.textContent = 'Gunman won!';
            setTimeout(function() {
                gunmanGame.soundDeath.play();
            }, 1000);
            setTimeout(gunmanGame.gameOver, 2000);
        }
    },

    nextLevel : function() {
        if(gunmanGame.level < 5) {
            gunmanGame.clearAnimation();
            gunmanGame.gameStatus.textContent = '';
            gunmanGame.gameStatus.classList.remove('game-status-show');
            gunmanGame.enemy.classList.remove('enemy-' + gunmanGame.randomEnemy);
            gunmanGame.levelButton.removeEventListener('click', gunmanGame.nextLevel);
            gunmanGame.levelButton.classList.remove('game-next-level-show');
            gunmanGame.level++;
            gunmanGame.randomEnemy = Math.round(1 + Math.random() * 4);
            gunmanGame.limit -= 150;
            gunmanGame.enemy.classList.add('enemy-' + gunmanGame.randomEnemy);
            gunmanGame.showUI();
            gunmanGame.enemy.addEventListener('mousedown', gunmanGame.playerHit);
            gunmanGame.enemyMove();
        } else gunmanGame.gameOver();
    },

    restartLevel : function() {
        gunmanGame.fault = false;
        gunmanGame.gameStatus.classList.remove('game-status-show');
        gunmanGame.enemy.addEventListener('mousedown', gunmanGame.playerHit);
        gunmanGame.enemy.addEventListener('transitionend', gunmanGame.startDuel);
        gunmanGame.showUI();
        gunmanGame.enemyMove();
    },

    showUI : function() {
        gunmanGame.UILevel.textContent = 'Level ' + gunmanGame.level;
        gunmanGame.UIScore.textContent = gunmanGame.score;
        gunmanGame.UILimit.textContent = 'Gunman: ' + (gunmanGame.limit/1000).toFixed(2);
        gunmanGame.UITimer.textContent = 'You: 0.00 ';
    },

    gameOver : function() {
        var menuInner = gunmanGame.menu.querySelector('.menu-inner');
        if(gunmanGame.gameScore) gunmanGame.gameScore.remove();
        gunmanGame.gameScore = document.createElement('p');
        gunmanGame.gameScore.textContent = 'Your reward: ' + gunmanGame.score;
        menuInner.insertBefore(gunmanGame.gameScore, menuInner.firstChild);
        gunmanGame.menu.classList.remove('menu-hide');
        gunmanGame.levelButton.removeEventListener('click', gunmanGame.nextLevel);
        gunmanGame.levelButton.classList.remove('game-next-level-show');
        gunmanGame.clearAnimation();
    },


    enemyWalk : function() {
        gunmanGame.clearAnimation();
        gunmanGame.enemy.classList.add('enemy-' + gunmanGame.randomEnemy + '-walk');
    },
    enemyStay : function() {
        gunmanGame.clearAnimation();
        gunmanGame.enemy.classList.add('enemy-' + gunmanGame.randomEnemy + '-stay');
    },

    enemyReady : function() {
        gunmanGame.clearAnimation();
        gunmanGame.enemy.classList.add('enemy-' + gunmanGame.randomEnemy + '-ready');
    },

    enemyHit : function() {
        gunmanGame.clearAnimation();
        gunmanGame.enemy.classList.add('enemy-' + gunmanGame.randomEnemy + '-hit');
        gunmanGame.game.classList.add('game-hit');
    },

    enemyDown : function() {
        gunmanGame.clearAnimation();
        gunmanGame.enemy.classList.add('enemy-' + gunmanGame.randomEnemy + '-down');
    },
    enemyDead : function() {
        gunmanGame.clearAnimation();
        gunmanGame.enemy.classList.add('enemy-' + gunmanGame.randomEnemy + '-dead');
    },
    clearAnimation : function() {
        for(var j = 1; j < 6; j++) {
            gunmanGame.enemy.classList.remove('enemy-' + j + '-walk');
            gunmanGame.enemy.classList.remove('enemy-' + j + '-stay');
            gunmanGame.enemy.classList.remove('enemy-' + j + '-ready');
            gunmanGame.enemy.classList.remove('enemy-' + j + '-hit');
            gunmanGame.enemy.classList.remove('enemy-' + j + '-down');
            gunmanGame.enemy.classList.remove('enemy-' + j + '-dead');
            gunmanGame.game.classList.remove('game-hit');
        }
    }
};
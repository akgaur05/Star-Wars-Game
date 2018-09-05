const starWarsRPG = function() {
 
    // Variables for the game
    const numPages        = $(".page").length;
    let   currentPage     = 0;

    const characters_name = ["Rey", "Luke", "Darth", "Storm"];
    const numCharacters   = characters_name.length;
    let   characters      = new Array(numCharacters);
    
    // Variables for the user
    let myID, enemyID;
    let numEnemiesLeft;
    let clickDisabled = false;

    this.startNewGame = function() {
        for (let i = 0; i < numCharacters; i++) {
            // Assign random stats (hit points, attack points, damage)
            characters[i] = {
                "name": characters_name[i],
                "hp"  : 10 * randomInteger(10, 20),
                "ap"  : randomInteger(6, 25)
            };

            // Damage will increase for the player, but not for the enemies
            characters[i].damage = characters[i].ap;

            // Reset character selection page
            $(`.characters:nth-of-type(${i + 1}) .hp`).text(displayHP(characters[i].hp));
            
            // Reset enemy selection page
            $(`.enemies:nth-of-type(${i + 1}) .hp`).text(displayHP(characters[i].hp));
        }

        // Reset character and enemy selection pages
        $(".characters, .enemies").css({"display": "block"});
        $(".characters img, .enemies img").css({"border-color": "var(--color-text)"});

        // Reset variables
        myID    = -1;
        enemyID = -1;
        numEnemiesLeft = numCharacters - 1;

        // Display to the browser
        displayCurrentPage();
        resetBattlePage();
    }


    function displayCurrentPage() {
        $(".page").css({"display": "none"});
        $(`.page:nth-of-type(${currentPage + 1})`).css({"display": "block"});
    }

    function resetBattlePage() {
        // Elements such as #battle_player img, #battle_enemy img can be
        // overwritten later
        $("#battle_player, #battle_enemy").css({"animation-name": "none"});
        $(".damageReceived").text("");
        $("#battle_button").text("Attack!");
    }

    function displayHP(hp) {
        return `HP.${hp}`;
    }

    this.getCurrentPage = function() {
        return currentPage;
    }

    this.getClickDisabled = function() {
        return clickDisabled;
    }

    this.getMyID = function() {
        return myID;
    }

    this.getEnemyID = function() {
        return enemyID;
    }


   //updates details
    this.updatePage = function(changeBy) {
        currentPage = (currentPage + changeBy + numPages) % numPages;

        switch (currentPage) {
            // Enemy selection
            case 2:
                // Reset enemy ID
                enemyID = -1;
                resetBattlePage();

                // Hide the player's character and enemies who died
                for (let i = 0; i < numCharacters; i++) {
                    if (i === myID || characters[i].hp === 0) {
                        $(`.enemies:nth-of-type(${i + 1})`).css({"display": "none"});
                    }
                }

                // Display the player's character in battle
                $("#battle_player img").attr("src", `./assets/images/${characters[myID].name}.jpg`);
                $("#battle_player img").css("border-color", "var(--color-character)");
                $("#battle_player .name").text(characters[myID].name);
                $("#battle_player .hp").text(displayHP(characters[myID].hp));

                break;

            // Battle
            case 3:
                // Display the enemy in battle
                $("#battle_enemy img").attr("src", `assets/images/${characters[enemyID].name}.jpg`);
                $("#battle_enemy img").css("border-color", "var(--color-enemy)");
                $("#battle_enemy .name").text(characters[enemyID].name);
                $("#battle_enemy .hp").text(displayHP(characters[enemyID].hp));

                break;
                
        }

        displayCurrentPage();
    }

    this.updateClickDisabled = function(changeTo) {
        clickDisabled = changeTo;
    }

    this.updateMyID = function(changeTo) {
        myID = changeTo;

        $(".characters img").css({"border-color": "var(--color-text)"});
        $(`.characters:nth-of-type(${myID + 1}) img`).css({"border-color": "var(--color-character)"});
    }

    this.updateEnemyID = function(changeTo) {
        enemyID = changeTo;

        $(".enemies img").css({"border-color": "var(--color-text)"});
        $(`.enemies:nth-of-type(${enemyID + 1}) img`).css({"border-color": "var(--color-enemy)"});
    }


    // Generate a random number between a and b
    function randomInteger(a, b) {
        return Math.floor((b - a + 1) * Math.random()) + a;
    }

    this.attack = function() {
        const player = characters[myID];
        const enemy  = characters[enemyID];

        if (player.hp === 0 || enemy.hp === 0) {
            return;
        }
        
            //The player attacks the enemy
        enemy.hp = Math.max(enemy.hp - player.damage, 0);

        $("#battle_enemy").css({"z-index": "0"});
        $("#battle_player").css({
            "animation": "attack_right 1.00s cubic-bezier(.36, .07, .19, .97) both",
            "z-index"  : "1"
        });
        $("#battle_player").replaceWith($("#battle_player").clone());

        setTimeout(function() {
            $("#battle_enemy .hp").text(displayHP(enemy.hp));
            $("#battle_enemy .damageReceived").text(-player.damage);
            $("#battle_enemy .damageReceived").replaceWith($("#battle_enemy .damageReceived").clone());

            // The player's damage increases after attack
            player.damage += player.ap;

        }, 200);


        
           // enemy attacks the player
        if (enemy.hp > 0) {
            player.hp = Math.max(player.hp - enemy.damage, 0);

            setTimeout(function() {
                $("#battle_player").css({"z-index": "0"});
                $("#battle_enemy .damageReceived").text("");
                $("#battle_enemy").css({
                    "animation": "attack_left 1.00s cubic-bezier(.36, .07, .19, .97) both",
                    "z-index"  : "1"
                });
                $("#battle_enemy").replaceWith($("#battle_enemy").clone());

            }, 1500);

            setTimeout(function() {
                $("#battle_player .hp").text(displayHP(player.hp));
                $("#battle_player .damageReceived").text(-enemy.damage);
                $("#battle_player .damageReceived").replaceWith($("#battle_player .damageReceived").clone());

            }, 1700);

            setTimeout(function() {
                $("#battle_player .damageReceived").text("");
                
            }, 3000);

            if (player.hp === 0) {
                clickDisabled = false;

                setTimeout(function() { $("#battle_button").text("You lost!"); }, 2500);
                setTimeout(function() { $("#battle_button").text("Restart"); }, 3800);
            }

        } else {
            clickDisabled = false;
            numEnemiesLeft--;

            setTimeout(function() { $("#battle_button").text("You won!"); }, 1000);
            setTimeout(function() { $("#battle_button").text((numEnemiesLeft > 0) ? "Next" : "Restart"); }, 2300);

        }
    }
}



//starts new game on page load
let game;

$(document).ready(function() {
    game = new starWarsRPG();
    game.startNewGame();

  //user Actions
    // Page selection
    $(".page_prev").on("click", function() {
        game.updatePage(-1);
    });

    $(".page_next").on("click", function() {
        // Make sure that the user has selected a character
        if ((game.getCurrentPage() === 1 && game.getMyID()    === -1) ||
            (game.getCurrentPage() === 2 && game.getEnemyID() === -1)) {
            return;
        }

        game.updatePage(1);
    });

    // Character selection
    $(".characters").on("click", function() {
        game.updateMyID($(".characters").index(this));
    });

    // Enemy selection
    $(".enemies").on("click", function() {
        game.updateEnemyID($(".enemies").index(this));
    });

    // Battle
    $("#battle_button").on("click", function() {
        if (game.getClickDisabled()) {
            return;
        }

        // Prevent button mashing
        game.updateClickDisabled(true);
        setTimeout(function() { game.updateClickDisabled(false); }, 3000);

        switch ($(this).text()) {
            case "Attack!":
                game.attack();

                break;

            case "Next":
                game.updatePage(-1);

                break;

            case "Restart":
                game.startNewGame();
                game.updatePage(1);

                break;

        }
    });
});
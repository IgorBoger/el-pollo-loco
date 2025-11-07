class Endboss extends MovableObject {
    // x = 2 * 720; // Standart
    // y = -50;
    // height = 500;
    // width = 420;

    x = 350; // Test
    y = 40;
    height = 400;
    width = 360;


    IMAGES_WALKING = [
        '../img/4_enemie_boss_chicken/1_walk/G1.png',
        '../img/4_enemie_boss_chicken/1_walk/G2.png',
        '../img/4_enemie_boss_chicken/1_walk/G3.png',
        '../img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    IMAGES_ALERT = [
        '../img/4_enemie_boss_chicken/2_alert/G5.png',
        '../img/4_enemie_boss_chicken/2_alert/G6.png',
        '../img/4_enemie_boss_chicken/2_alert/G7.png',
        '../img/4_enemie_boss_chicken/2_alert/G8.png',
        '../img/4_enemie_boss_chicken/2_alert/G9.png',
        '../img/4_enemie_boss_chicken/2_alert/G10.png',
        '../img/4_enemie_boss_chicken/2_alert/G11.png',
        '../img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    IMAGES_ATTACK = [
        '../img/4_enemie_boss_chicken/3_attack/G13.png',
        '../img/4_enemie_boss_chicken/3_attack/G14.png',
        '../img/4_enemie_boss_chicken/3_attack/G15.png',
        '../img/4_enemie_boss_chicken/3_attack/G16.png',
        '../img/4_enemie_boss_chicken/3_attack/G17.png',
        '../img/4_enemie_boss_chicken/3_attack/G18.png',
        '../img/4_enemie_boss_chicken/3_attack/G19.png',
        '../img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    IMAGES_HURT = [
        '../img/4_enemie_boss_chicken/4_hurt/G21.png',
        '../img/4_enemie_boss_chicken/4_hurt/G22.png',
        '../img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    IMAGES_DEAD = [
        '../img/4_enemie_boss_chicken/5_dead/G24.png',
        '../img/4_enemie_boss_chicken/5_dead/G25.png',
        '../img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    currentAnimation = null;
    walkFrameMs = 120;       // etwas ruhiger als Pepe (wirkt schwerer)
    lastAnimAt = 0;          // Zeitstempel für maybeAdvance

    // Sanfte Bewegung für „echteres“ Gehen (kleines Lerp)
    baseWalkSpeed = 1.1;
    currentSpeed = 0;
    targetSpeed = 0;

    // Einfache Patrouille (Startbereiche kannst du später feinjustieren)
    patrolLeft = this.x - 200;
    patrolRight = this.x + 200;
    patrolDir = -1;          // -1 = nach links, 1 = nach rechts

    // Sanftere Drehung (statt schnellem Flip)
    facing = -1;                 // 1 = schaut nach rechts, -1 = schaut nach links (gleitender Wert)
    facingThreshold = 0.7;      // Hysterese: erst ab ±0.6 wirklich flippen
    facingLerp = 0.12;          // wie schnell die Blickrichtung dem Ziel folgt


    // === Alert (Telegraphie) ===
    alertFrameMs = 300;
    alertDurationMs = 0;
    // alertFrameMs = 100;       // schneller als Walk
    // alertDurationMs = 500;    // 0.5 s Vorwarnung
    alertRange = 220;         // ab dieser Distanz: aufmerken
    alertUntil = 0;           // Zeitstempel bis wann Alert läuft

    // nach Alert kurz „immun“ gegen neuen Alert
    postAlertCooldownUntil = 0;   // ms-Zeitstempel
    // === Nach Alert: kurze Verfolgung ohne neuen Alert ===
    chaseUntil = 0;           // ms-Zeitstempel bis wann „chase“ läuft
    chaseSpeed = 2.0;         // etwas schneller als baseWalkSpeed
    // Chase-Status, damit kein neuer Alert dazwischen funkt
    isChasing = false;

    // === Attack (Dash nach Alert) ===
    attackFrameMs = 90;          // schneller Takt für G13–G20
    attackRange = 200;           // nur wenn Pepe noch so nah ist → Attack
    attackDashSpeed = 6;         // Dash-Geschwindigkeit
    attackUntil = 0;             // Timer für Attack-Dauer

    // === Aggro (Boss bleibt „im Kampf“, patrouilliert nicht zurück) ===
    aggro = false;
    aggroKeepRange = 700;  // bleibt im Kampf, solange Pepe innerhalb
    aggroLoseRange = 900;  // verliert Aggro, wenn Pepe weiter weg


    // === Erholungsphase nach Attack ===
    recoveryAfterAttackMs = 1200;   // Pause nach einer Attacke
    recoverUntil = 0;               // Timestamp bis wann Pause aktiv ist




    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);

        // Alert-Dauer passend zu Frames × Framezeit
        this.alertDurationMs = (this.alertFrameMs * this.IMAGES_ALERT.length) + 60;
        console.log('🔧 Alert-Dauer automatisch berechnet:', this.alertDurationMs, 'ms');

        // Attack-Dauer passend zu Frames × Framezeit
        this.attackDurationMs = (this.attackFrameMs * this.IMAGES_ATTACK.length) + 60;

        this.energy = 100; // Neu: Energie wie andere Gegner

        // Startzustand: Walking
        this.currentAnimation = 'walk';
        this.targetSpeed = this.baseWalkSpeed * this.patrolDir;

        this.animate();

        // Wird nur für Colisionberechnung gezeichnet, danach muss weg!!!
        this.frameOffsetX = 30;
        this.frameWidth = this.width - 40;

        this.frameOffsetY = 70;
        this.frameHeight = this.height - 90;
    }


    // animate() {
    //     this.animationInterval = setInterval(() => {
    //         if (this.isDead()) {
    //             this.playAnimation(this.IMAGES_DEAD);

    //             // Nach 2 Sekunde: Endboss entfernen
    //             setTimeout(() => {
    //                 if (this.world) {
    //                     this.world.level.enemies = this.world.level.enemies.filter(e => e !== this);
    //                 }
    //                 clearInterval(this.animationInterval); // Stoppe Animation nach Tod
    //             }, 2000);

    //         } else if (this.isHurt()) {
    //             this.playAnimation(this.IMAGES_HURT);
    //         } else {
    //             this.playAnimation(this.IMAGES_WALKING);
    //         }
    //     }, 200);
    // }


    animate() {
        // --- A) Bewegung / AI: 60 FPS ---
        this.aiInterval = setInterval(() => {

            if (this.isDead()) {
                this.setAnimation('dead');
                this.currentSpeed = 0;

                // Nach 2 Sek. aus Welt entfernen
                setTimeout(() => {
                    if (this.world) {
                        this.world.level.enemies = this.world.level.enemies.filter(e => e !== this);
                    }
                    clearInterval(this.aiInterval);
                    clearInterval(this.animationInterval);
                }, 2000);
                return; // Rest der AI überspringen
            }


            const now = performance.now();
            if (!this.world || !this.world.character) return;
            const pepeX = this.world.character.x;
            const dist = Math.abs(pepeX - this.x);

            // ⬅️ NEU: Erholungsfenster nach Attacke – Boss wartet kurz
            if (now < this.recoverUntil) {
                this.setAnimation('walk');        // neutrale Idle/Walk-Frames ok
                this.targetSpeed = 0;
                this.currentSpeed += (0 - this.currentSpeed) * 0.25; // sanft ausrollen
                // keine Chase/Alert-Entscheidungen in der Pause
            } else {
                // ... dein bestehender Code (Patrouille / Alert / Chase / Attack) läuft hier
            }


            // Aggro halten/verlieren
            if (this.aggro) {
                if (dist > this.aggroLoseRange) {
                    // Kampf abbrechen → normal patrouillieren
                    this.aggro = false;
                    this.isChasing = false;
                    this.chaseUntil = 0;
                } else if (
                    this.currentAnimation !== 'alert' &&
                    this.currentAnimation !== 'attack' &&
                    performance.now() >= this.recoverUntil            // ⬅️ NEU: keine Verfolgung während Erholung
                ) {
                    // this.isChasing = true;
                }
            }


            if (this.isHurt()) {
                this.setAnimation('hurt');
                this.currentSpeed = 0;
                setTimeout(() => {
                    if (!this.isDead()) this.setAnimation('walk');
                }, 400);
            }


            // Patrouillenrichtung wechseln
            if (this.x <= this.patrolLeft) this.patrolDir = 1;
            if (this.x >= this.patrolRight) this.patrolDir = -1;

            // Patrouille NUR wenn NICHT alert/attack/chase/aggro
            if (this.currentAnimation !== 'alert'
                && this.currentAnimation !== 'attack'
                && !this.isChasing && !this.aggro) {
                this.targetSpeed = this.baseWalkSpeed * this.patrolDir;
                this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.12;
                // an den Kanten vor dem Dir-Switch kurz Tempo reduzieren
                const atLeftEdge = this.x <= this.patrolLeft;
                const atRightEdge = this.x >= this.patrolRight;
                if (atLeftEdge || atRightEdge) {
                    // leichtes Ausrollen
                    this.currentSpeed *= 0.85;
                }
            }

            // Während „chase“: gezielt auf Pepe zulaufen (Patrouille ignorieren)
            if (now < this.chaseUntil && this.currentAnimation !== 'attack') {
                const dir = (pepeX > this.x) ? 1 : -1;
                this.targetSpeed = this.chaseSpeed * dir;
                // keine Kantenbremse hier – wir überschreiben das Tempo bewusst

                // 🔧 NEU: auch im Chase Richtung zeigen + Geschwindigkeit lerpen
                this.otherDirection = (pepeX > this.x);
                this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.18;  // sanft beschleunigen
                // Alternativ hart setzen (ohne Lerp):
                // this.currentSpeed = this.targetSpeed;
            }

            // während „chase“ Übergänge prüfen
            if (this.isChasing && this.currentAnimation !== 'attack') {
                // Attack starten, sobald nah genug
                if (dist <= this.attackRange) {
                    this.isChasing = false;
                    this.chaseUntil = 0;
                    this.setAnimation('attack');
                    this.attackUntil = now + this.attackDurationMs;
                    const dir = (pepeX > this.x) ? 1 : -1;
                    this.otherDirection = (pepeX > this.x);
                    this.currentSpeed = 0;
                    this.targetSpeed = this.attackDashSpeed * dir;
                }
                // Abbrechen, wenn Pepe wieder deutlich weg ist
                else if (dist > this.alertRange) {
                    this.isChasing = false;
                    this.chaseUntil = 0;
                    this.setAnimation('walk');
                    this.postAlertCooldownUntil = now + 300; // kleiner Puffer
                }
            }


            const speedRef = Math.abs(this.currentSpeed) > 0.2 ? this.currentSpeed : this.targetSpeed;
            const desiredFacing = (speedRef >= 0) ? 1 : -1;

            // Gleitend an Ziel-Blickrichtung annähern
            this.facing += (desiredFacing - this.facing) * this.facingLerp;

            // Erst flippen, wenn die geglättete Richtung „weit genug“ in eine Seite kippt
            if (this.facing > this.facingThreshold) {
                this.otherDirection = true; // schaut nach links
            } else if (this.facing < -this.facingThreshold) {
                this.otherDirection = false;  // schaut nach rechts
            }

            if (dist <= this.alertRange
                && dist > this.attackRange            // nicht schon kurz vor Attack
                && !this.isChasing                    // während „chase“ kein Alert
                && this.currentAnimation !== 'alert'
                && now >= this.postAlertCooldownUntil) {


                // console.log("Pepe befindet sich  bei -", pepeX);
                // console.log("Endboss befindet sich  bei -", this.x);
                // console.log(dist);
                // console.log('⚠️ ALERT ausgelöst bei Distanz:', dist);
                this.setAnimation('alert');
                this.aggro = true; // ab jetzt im Kampf

                // // NEU – Dauer dynamisch passend zu (Anzahl Frames × Framezeit)
                this.alertUntil = now + (this.alertFrameMs * this.IMAGES_ALERT.length) + 60; // +60 ms Puffer
            }

            // b) Während Alert: auf der Stelle bleiben, nach Ablauf zurück zu Walk
            if (this.currentAnimation === 'alert') {
                // Richtung zum Spieler „anschauen“ (optional)
                this.otherDirection = (pepeX > this.x); // Endboss schaut standardmäßig nach links
                // console.log(this.otherDirection);

                this.currentSpeed = 0;             // ⬅︎ NEU: sofortiger Stopp
                // (die bisherige Lerp-Zeile zu 0 kannst du entfernen oder lassen – sie wirkt dann eh nicht mehr)

                if (now >= this.alertUntil) {
                    console.log(now);
                    console.log(this.alertUntil);
                    if (dist <= this.attackRange) {
                        // → Attack starten
                        this.setAnimation('attack');
                        this.attackUntil = now + this.attackDurationMs;
                        const dir = (pepeX > this.x) ? 1 : -1;
                        this.otherDirection = (pepeX > this.x);
                        this.currentSpeed = 0;
                        this.targetSpeed = this.attackDashSpeed * dir;
                    } else {
                        // → Verfolgung starten, bis Attack-Range erreicht ODER Pepe wieder weit weg ist
                        this.setAnimation('walk');
                        this.isChasing = true;
                        // this.chaseUntil = Number.POSITIVE_INFINITY;  // läuft bis Abbruchbedingung
                        this.chaseUntil = now + 900;   // ~0.9 s Verfolgung, dann neu bewerten
                    }


                }
            }


            // === ATTACK-Logik ===
            if (this.currentAnimation === 'attack') {
                // während Attack nicht patrouillieren
                const dir = (pepeX > this.x) ? 1 : -1;
                this.otherDirection = (pepeX > this.x);

                // zügig auf Dash-Speed lerpen
                this.currentSpeed += (this.attackDashSpeed * dir - this.currentSpeed) * 0.25;

                if (now >= this.attackUntil) {
                    this.currentSpeed = 0;

                    // ⬅️ NEU: Cooldown/Erholung nach Attack
                    this.recoverUntil = now + this.recoveryAfterAttackMs;
                    this.postAlertCooldownUntil = this.recoverUntil;  // in der Pause auch kein neuer Alert
                    this.isChasing = false;
                    this.chaseUntil = 0;

                    this.setAnimation('walk');    // bleibt stehen / neutral
                }
            }


            // Position aktualisieren
            this.x += this.currentSpeed;
        }, 1000 / 60);

        // --- B) Animations-Frames: ~20 Hz ---
        this.animationInterval = setInterval(() => {
            // --- Frames je nach aktueller Animation ---
            const now = performance.now();
            let imgs, frameMs;

            if (this.currentAnimation === 'alert') {
                imgs = this.IMAGES_ALERT;
                frameMs = this.alertFrameMs;
            } else if (this.currentAnimation === 'attack') {
                imgs = this.IMAGES_ATTACK;
                frameMs = this.attackFrameMs;
            } else {
                imgs = this.IMAGES_WALKING;
                frameMs = this.walkFrameMs;
            }


            this.maybeAdvance(imgs, now, frameMs);

        }, 50);
    }


    faceTo(targetX) { this.otherDirection = (targetX < this.x); }

    setAnimation(name) {
        if (this.currentAnimation !== name) {
            this.currentAnimation = name;
            this.currentImage = 0;
            this.lastAnimAt = 0;
        }
    }


    maybeAdvance(images, now, frameMs) {
        if ((now - this.lastAnimAt) >= frameMs) {
            this.playAnimation(images);
            this.lastAnimAt = now;
        }
    }

}
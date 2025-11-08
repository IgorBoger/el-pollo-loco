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
        [this.IMAGES_WALKING, this.IMAGES_ALERT, this.IMAGES_ATTACK,
        this.IMAGES_HURT, this.IMAGES_DEAD].forEach(imgs => this.loadImages(imgs));
        this.alertDurationMs = (this.alertFrameMs * this.IMAGES_ALERT.length) + 60;
        // console.log('🔧 Alert-Dauer automatisch berechnet:', this.alertDurationMs, 'ms');
        this.attackDurationMs = (this.attackFrameMs * this.IMAGES_ATTACK.length) + 60;
        this.energy = 100; // Neu: Energie wie andere Gegner
        this.currentAnimation = 'walk';
        this.targetSpeed = this.baseWalkSpeed * this.patrolDir;
        this.animate();
        this.setFrameBounds(30, 70, 40, 90);
    }


    setFrameBounds(offsetX, offsetY, widthDiff, heightDiff) {
        this.frameOffsetX = offsetX;
        this.frameWidth = this.width - widthDiff;
        this.frameOffsetY = offsetY;
        this.frameHeight = this.height - heightDiff;
    }


    animate() {
        this.aiInterval = setInterval(() => {
            if (this.handleDeath()) return;
            if (!this.world || !this.world.character) return;
            const now = performance.now();
            const pepeX = this.world.character.x;
            const dist = Math.abs(pepeX - this.x);
            if (this.isInRecovery(now)) {
                this.applyRecovery();
            } else {
                this.updateAI(now, pepeX, dist);
            }
            this.updateFacing();
            this.x += this.currentSpeed;
        }, 1000 / 60);
        this.animationInterval = setInterval(() => {
            this.updateFrames();
        }, 50);
    }


    animate() {
        this.aiInterval = setInterval(() => {
            if (this.handleDeath() || !this.world?.character) return;
            const now = performance.now();
            const pepeX = this.world.character.x;
            const dist = Math.abs(pepeX - this.x);
            this.isInRecovery(now)
                ? this.applyRecovery()
                : this.updateAI(now, pepeX, dist);
            this.updateFacing();
            this.x += this.currentSpeed;
        }, 1000 / 60);
        this.animationInterval = setInterval(() => this.updateFrames(), 50);
    }


    handleDeath() {
        if (!this.isDead()) return false;
        this.setAnimation('dead');
        this.currentSpeed = 0;
        setTimeout(() => {
            if (this.world) {
                this.world.level.enemies = this.world.level.enemies.filter(e => e !== this);
            }
            clearInterval(this.aiInterval);
            clearInterval(this.animationInterval);
        }, 2000);
        return true;
    }


    isInRecovery(now) {
        return now < this.recoverUntil;
    }

    applyRecovery() {
        this.setAnimation('walk');        // neutrale Idle/Walk-Frames
        this.targetSpeed = 0;
        this.currentSpeed += (0 - this.currentSpeed) * 0.25; // sanft ausrollen
    }


    updateAI(now, pepeX, dist) {
        this.updateAggro(dist);
        if (this.handleHurtState()) return;
        this.updatePatrol();
        this.updateChaseMovement(now, pepeX);
        this.updateChaseTransitions(now, pepeX, dist);
        this.tryStartAlert(now, pepeX, dist);
        this.updateAlertState(now, pepeX, dist);
        this.updateAttackState(now, pepeX);
    }


    updateAggro(dist) {
        if (!this.aggro) return;
        if (dist > this.aggroLoseRange) {
            this.aggro = false;
            this.isChasing = false;
            this.chaseUntil = 0;
        }
    }


    handleHurtState() {
        if (!this.isHurt()) return false;
        this.setAnimation('hurt');
        this.currentSpeed = 0;
        setTimeout(() => {
            if (!this.isDead()) this.setAnimation('walk');
        }, 400);
        return true;
    }


    updatePatrol() {
        if (this.isChasing || this.aggro ||
            this.currentAnimation === 'alert' ||
            this.currentAnimation === 'attack') return;
        this.targetSpeed = this.baseWalkSpeed * this.patrolDir;
        this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.12;
        if (this.x <= this.patrolLeft || this.x >= this.patrolRight) {
            this.patrolDir *= -1;
            this.currentSpeed *= 0.85;
        }
    }


    updateChaseMovement(now, pepeX) {
        if (now >= this.chaseUntil || this.currentAnimation === 'attack') return;
        const dir = pepeX > this.x ? 1 : -1;
        this.targetSpeed = this.chaseSpeed * dir;
        this.otherDirection = pepeX > this.x;
        this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.18;
    }


    updateChaseTransitions(now, pepeX, dist) {
        if (!this.isChasing || this.currentAnimation === 'attack') return;
        if (dist <= this.attackRange) {
            this.startAttack(now, pepeX);
        } else if (dist > this.alertRange) {
            this.isChasing = false;
            this.chaseUntil = 0;
            this.setAnimation('walk');
            this.postAlertCooldownUntil = now + 300;
        }
    }


    startAttack(now, pepeX) {
        this.isChasing = false;
        this.chaseUntil = 0;
        this.setAnimation('attack');
        this.attackUntil = now + this.attackDurationMs;
        const dir = pepeX > this.x ? 1 : -1;
        this.otherDirection = pepeX > this.x;
        this.currentSpeed = 0;
        this.targetSpeed = this.attackDashSpeed * dir;
    }


    tryStartAlert(now, pepeX, dist) {
        if (dist > this.alertRange || dist <= this.attackRange) return;
        if (this.isChasing || this.currentAnimation === 'alert') return;
        if (now < this.postAlertCooldownUntil) return;
        this.setAnimation('alert');
        this.aggro = true;
        this.alertUntil =
            now + this.alertFrameMs * this.IMAGES_ALERT.length + 60;
    }


    updateAlertState(now, pepeX, dist) {
        if (this.currentAnimation !== 'alert') return;
        this.otherDirection = pepeX > this.x;
        this.currentSpeed = 0;
        if (now < this.alertUntil) return;
        if (dist <= this.attackRange) {
            this.startAttack(now, pepeX);
        } else {
            this.setAnimation('walk');
            this.isChasing = true;
            this.chaseUntil = now + 900;
        }
    }


    updateAttackState(now, pepeX) {
        if (this.currentAnimation !== 'attack') return;
        const dir = pepeX > this.x ? 1 : -1;
        this.otherDirection = pepeX > this.x;
        this.currentSpeed +=
            (this.attackDashSpeed * dir - this.currentSpeed) * 0.25;
        if (now < this.attackUntil) return;
        this.currentSpeed = 0;
        this.recoverUntil = now + this.recoveryAfterAttackMs;
        this.postAlertCooldownUntil = this.recoverUntil;
        this.isChasing = false;
        this.chaseUntil = 0;
        this.setAnimation('walk');
    }


    updateFacing() {
        const speedRef = Math.abs(this.currentSpeed) > 0.2
            ? this.currentSpeed
            : this.targetSpeed;
        const desired = speedRef >= 0 ? 1 : -1;
        this.facing += (desired - this.facing) * this.facingLerp;
        if (this.facing > this.facingThreshold) this.otherDirection = true;
        else if (this.facing < -this.facingThreshold) this.otherDirection = false;
    }


    updateFrames() {
        const now = performance.now();
        let imgs = this.IMAGES_WALKING;
        let frameMs = this.walkFrameMs;
        if (this.currentAnimation === 'alert') {
            imgs = this.IMAGES_ALERT;
            frameMs = this.alertFrameMs;
        } else if (this.currentAnimation === 'attack') {
            imgs = this.IMAGES_ATTACK;
            frameMs = this.attackFrameMs;
        }
        this.maybeAdvance(imgs, now, frameMs);
    }


    faceTo(targetX) {
        this.otherDirection = (targetX < this.x);
    }


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
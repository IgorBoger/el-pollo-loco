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
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    currentAnimation = null;
    walkFrameMs = 100;       // etwas ruhiger als Pepe (wirkt schwerer)
    lastAnimAt = 0;          // Zeitstempel für maybeAdvance

    // Sanfte Bewegung für „echteres“ Gehen (kleines Lerp)
    baseWalkSpeed = 0.5;
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
    chaseSpeed = 1.0;         // etwas schneller als baseWalkSpeed
    // Chase-Status, damit kein neuer Alert dazwischen funkt
    isChasing = false;

    // === Attack (Dash nach Alert) ===
    attackFrameMs = 100;          // schneller Takt für G13–G20
    attackRange = 200;           // nur wenn Pepe noch so nah ist → Attack
    attackDashSpeed = 4;         // Dash-Geschwindigkeit
    attackUntil = 0;             // Timer für Attack-Dauer

    // 🆕 Treffer erst nach kurzem Sicht-Fenster gültig
    attackHitDelayMs = 300;    // 200–300ms ist gut
    attackHitAllowedAt = 0;

    // === Aggro (Boss bleibt „im Kampf“, patrouilliert nicht zurück) ===
    aggro = false;
    aggroKeepRange = 700;  // bleibt im Kampf, solange Pepe innerhalb
    aggroLoseRange = 900;  // verliert Aggro, wenn Pepe weiter weg


    // === Erholungsphase nach Attack ===
    recoveryAfterAttackMs = 2400;   // Pause nach einer Attacke
    recoverUntil = 0;               // Timestamp bis wann Pause aktiv ist

    // Sounds......

    // Appear
    appearSoundPlayed = false;

    // Alert
    alertSoundCooldownUntil = 0;
    alertSoundCooldownMs = 1400;
    scheduledAlertSoundAt = 0;
    appearToAlertDelayMs = 950;


    // Dead
    deadSoundPlayed = false;


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        [this.IMAGES_WALKING, this.IMAGES_ALERT, this.IMAGES_ATTACK,
        this.IMAGES_HURT, this.IMAGES_DEAD].forEach(imgs => this.loadImages(imgs));
        this.alertDurationMs = (this.alertFrameMs * this.IMAGES_ALERT.length) + 60;
        this.attackDurationMs = (this.attackFrameMs * this.IMAGES_ATTACK.length) + 80;
        this.energy = 100;
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
            if (isGamePaused || this.world?.stopped) return;
            if (this.handleDeath() || !this.world?.character) return;
            const now = performance.now();
            const pepeX = this.world.character.x;
            const dist = Math.abs(pepeX - this.x);
            this.isInRecovery(now)
                ? this.applyRecovery()
                : this.updateAI(now, pepeX, dist);
            this.updateFacing();
            this.applyWalkBob(now);
            this.applyHorizontalMotion();
        }, 1000 / 60);
        this.animationInterval = setInterval(() => {
            if (isGamePaused || this.world?.stopped) return;
            this.updateFrames();
        }, 50);
    }


    handleDeath() {
        if (!this.isDead()) return false;
        // this.setAnimation('dead');
        const changedToDead = this.setAnimation('dead');
        if (changedToDead) this.playEndbossDeadSound();
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
        if (this.currentAnimation !== 'hurt') {
            const changedToAlert = this.setAnimation('alert');
            if (changedToAlert) this.playEndbossAlertSound(performance.now());
        }
        this.targetSpeed = 0;
        this.currentSpeed += (0 - this.currentSpeed) * 0.25;
    }


    updateAI(now, pepeX, dist) {
        this.tryPlayScheduledEndbossAlertSound(now);
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

        // KI pausieren für Dauer des Hurt-Zustands
        const until = performance.now() + 1000;
        this.recoverUntil = until;                 // KI pausiert
        this.postAlertCooldownUntil = until;       // keine neuen Alerts
        this.isChasing = false;
        this.chaseUntil = 0;
        setTimeout(() => {
            if (!this.isDead()) {
                const now2 = performance.now();
                const pepeX = this.world?.character?.x ?? this.x;
                const dir = pepeX > this.x ? 1 : -1;

                // Sichtbar in Lauf übergehen und SOFORT wieder bewegen
                this.setAnimation('walk');
                this.chaseUntil = now2 + 900;

                // wichtig: Tempo direkt setzen, nicht warten
                this.targetSpeed = this.chaseSpeed * dir;
                this.currentSpeed = this.targetSpeed;
            }
        }, 1000);

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
        if (this.isInRecovery(now) || now < this.postAlertCooldownUntil) return;
        if (now < (this.forceAlertUntil || 0) || this.currentAnimation === 'hurt') return;
        this.isChasing = false; this.chaseUntil = 0;

        // this.setAnimation('attack');
        const changedToAttack = this.setAnimation('attack');
        if (changedToAttack) this.playEndbossAttackSound();

        this.attackUntil = now + this.attackDurationMs;

        const dir = pepeX > this.x ? 1 : -1;
        this.otherDirection = pepeX > this.x;
        this.currentSpeed = 0; this.targetSpeed = this.attackDashSpeed * dir;
        this.attackHitAllowedAt = now + this.attackHitDelayMs;
        this.hasHitInCurrentAttack = false;
    }


    tryStartAlert(now, pepeX, dist) {
        const inCd = this.isInRecovery(now) || now < this.postAlertCooldownUntil;
        if (inCd || this.isHurt?.() || this.isChasing) return;
        if (this.currentAnimation === 'alert' || this.currentAnimation === 'attack') return;
        if (dist > this.alertRange) return;
        const changedToAlert = this.setAnimation('alert');
        if (!changedToAlert) return;
        this.aggro = true;
        this.handleAlertSounds(now);
        this.alertUntil = now + this.alertFrameMs * this.IMAGES_ALERT.length + 60;
        this.forceAlertUntil = Math.max(this.forceAlertUntil || 0, now + 300);
    }


    handleAlertSounds(now) {
        const isFirstEncounter = !this.appearSoundPlayed;
        if (isFirstEncounter) {
            this.playEndbossAppearSound();
            this.scheduleEndbossAlertSound(now);
            return;
        }
        this.playEndbossAlertSound(now);
    }


    playEndbossAppearSound() {
        if (this.appearSoundPlayed) return;
        const endbossAppear = this.world?.sounds?.endbossAppear;
        if (!endbossAppear) return;
        this.world.playEffectSound(endbossAppear);
        this.appearSoundPlayed = true;
        // pepeSnoring.volume = 0.8;
    }


    playEndbossAlertSound(now) {
        if (now < this.alertSoundCooldownUntil) return;
        const endbossAlert = this.world?.sounds?.endbossAlert;
        if (!endbossAlert) return;
        this.world.playEffectSound(endbossAlert);
        this.alertSoundCooldownUntil = now + this.alertSoundCooldownMs;
    }


    scheduleEndbossAlertSound(now) {
        this.scheduledAlertSoundAt = now + this.appearToAlertDelayMs;
    }


    tryPlayScheduledEndbossAlertSound(now) {
        if (!this.scheduledAlertSoundAt) return;
        if (now < this.scheduledAlertSoundAt) return;
        this.scheduledAlertSoundAt = 0;
        this.playEndbossAlertSound(now);
    }


    playEndbossAttackSound() {
        const endbossAttack = this.world?.sounds?.endbossAttack;
        if (!endbossAttack) return;
        this.world.playEffectSound(endbossAttack);
    }


    stop() {
        if (this.aiInterval) clearInterval(this.aiInterval);
        if (this.animationInterval) clearInterval(this.animationInterval);
        this.aiInterval = null;
        this.animationInterval = null;
        this.scheduledAlertSoundAt = 0;
    }


    updateAlertState(now, pepeX, dist) {
        if (this.currentAnimation !== 'alert') return;
        this.otherDirection = pepeX > this.x;
        this.currentSpeed = 0;
        if (now < (this.forceAlertUntil || 0)) return;
        if (now < this.alertUntil) return;
        if (dist <= this.attackRange + 40) { this.startAttack(now, pepeX); return; }
        this.setAnimation('walk');
        this.isChasing = true;
        this.chaseUntil = now + 900;

        // ➜ Sofort auf volle Laufgeschwindigkeit gehen (keine Anlaufphase)
        const dir = pepeX > this.x ? 1 : -1;
        this.otherDirection = pepeX > this.x;     // Blickrichtung korrekt setzen (optional, aber sauber)
        this.targetSpeed = this.chaseSpeed * dir;
        this.currentSpeed = this.targetSpeed;     // sofort gleiche Geschwindigkeit wie zu Beginn
    }



    updateAttackState(now, pepeX) {
        if (this.currentAnimation !== 'attack') return;

        if (this.isInRecovery(now) || now < this.postAlertCooldownUntil) {
            this.currentSpeed = 0; this.targetSpeed = 0;
            this.setAnimation('alert'); return;
        }

        const dir = this.targetSpeed >= 0 ? 1 : -1;
        this.currentSpeed += (this.attackDashSpeed * dir - this.currentSpeed) * 0.25;
        if (now < this.attackUntil) return;
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.recoverUntil = now + this.recoveryAfterAttackMs;
        this.postAlertCooldownUntil = this.recoverUntil;
        this.isChasing = false;
        this.chaseUntil = 0;
        // this.setAnimation('walk');
        this.setAnimation('alert');

    }


    updateFacing() {
        let speedRef =
            Math.abs(this.currentSpeed) > 0.2
                ? this.currentSpeed
                : (Math.abs(this.targetSpeed) > 0.2 ? this.targetSpeed : 0);
        if (Math.abs(speedRef) < 0.2 || this.currentAnimation === 'attack') return;
        const desired = speedRef >= 0 ? 1 : -1;
        this.facing += (desired - this.facing) * this.facingLerp;
        if (this.facing > this.facingThreshold) {
            this.otherDirection = true;
        } else if (this.facing < -this.facingThreshold) {
            this.otherDirection = false;
        }
    }


    applyWalkBob(now) {
        if (!this.baseY) {
            this.baseY = this.y;
        }

        const speedRef = Math.abs(this.currentSpeed) > 0.2 ? this.currentSpeed : this.targetSpeed;
        if (this.currentAnimation !== 'walk' || Math.abs(speedRef) < 0.2) {
            this.y = this.baseY;
            return;
        }

        const cycleMs = 300;      // Dauer eines Schrittzyklus (anpassen nach Gefühl)
        const amplitude = 1.2;    // Höhe der Bewegung in Pixeln (2–3 ist dezent)
        const t = (now % cycleMs) / cycleMs * Math.PI * 2;
        this.y = this.baseY + Math.sin(t) * amplitude;
    }


    applyHorizontalMotion() {
        if (Math.abs(this.currentSpeed) < 0.05) return;
        this.x += this.currentSpeed;
    }


    updateFrames() {
        const now = performance.now();
        let images = this.IMAGES_WALKING;
        let frameMs = this.walkFrameMs;
        if (this.currentAnimation === 'dead') {
            images = this.IMAGES_DEAD;
            frameMs = 160; // etwas langsamer, wirkt „schwer“
        } else if (this.currentAnimation === 'hurt') {
            images = this.IMAGES_HURT;
            frameMs = 120;
        } else if (this.currentAnimation === 'alert') {
            images = this.IMAGES_ALERT;
            frameMs = this.alertFrameMs;
        } else if (this.currentAnimation === 'attack') {
            images = this.IMAGES_ATTACK;
            frameMs = this.attackFrameMs;
        }
        if (images === this.IMAGES_WALKING) frameMs = this.walkFrameMs;
        this.maybeAdvance(images, now, frameMs);
    }


    faceTo(targetX) {
        this.otherDirection = (targetX < this.x);
    }


    // setAnimation(name) {
    //     if (this.currentAnimation !== name) {
    //         this.currentAnimation = name;
    //         this.currentImage = 0;
    //         this.lastAnimAt = 0;
    //     }
    // }


    setAnimation(name) {
        if (this.currentAnimation === name) return false;
        this.currentAnimation = name;
        this.currentImage = 0;
        this.lastAnimAt = 0;
        return true;
    }



    maybeAdvance(images, now, frameMs) {
        if ((now - this.lastAnimAt) >= frameMs) {
            this.playAnimation(images);
            this.lastAnimAt = now;
        }
    }


    hurtFlash() {
        if (this.currentAnimation === 'dead') return;
        this.setAnimation('hurt');
        this.playEndbossHurtSound();
        this.currentSpeed = 0;
        const until = performance.now() + 320;
        this.recoverUntil = Math.max(this.recoverUntil, until);
        this.postAlertCooldownUntil = Math.max(this.postAlertCooldownUntil, until);
        this.isChasing = false; this.chaseUntil = 0;
        setTimeout(() => {
            if (!this.isDead() && this.isInRecovery(performance.now()))
                this.setAnimation('alert');
        }, 320);
    }


    playEndbossHurtSound() {
        const endbossHurt = this.world?.sounds?.endbossHurt;
        if (!endbossHurt) return;
        this.world.playEffectSound(endbossHurt);
        // endbossHurt.volume = 0.8;
    }


    playEndbossDeadSound() {
        if (this.deadSoundPlayed) return;

        const endbossDead = this.world?.sounds?.endbossDead;
        if (!endbossDead) return;

        this.world.playEffectSound(endbossDead);
        this.deadSoundPlayed = true;
    }


    stun(ms = 700) {
        const now = performance.now();
        this.setAnimation('hurt');
        this.currentSpeed = 0; this.targetSpeed = 0;
        this.attackUntil = now;                  // Attack sofort abbrechen
        this.isChasing = false; this.chaseUntil = 0;
        const until = now + ms;
        const grace = until + 250;               // 🆕 kleine Pause NACH Hurt
        this.recoverUntil = until;               // KI pausiert (keine Moves)
        this.postAlertCooldownUntil = grace;     // keine Alerts/Attacks starten
    }

}
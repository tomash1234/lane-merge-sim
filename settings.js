
class CarSettings {
    constructor(maxSpeed=200 / 3.6, length=4.56, height=1.5, width=1.823, bodyHeight=0.4,
    maxAcc=3, maxBreakingAcc=-6, color=0xcf04020, maxSteeringAngle=0.3, mass=1200,
    frontArea=2.5, engineForce=4100, cameraHeight=1.25, mirrorZ=1){
        this.maxSpeed = maxSpeed;
        this.length = length;
        this.width = width;
        this.height = height;
        this.bodyHeight = bodyHeight;
        this.maxAcc = maxAcc;
        this.maxBreakingAcc = maxBreakingAcc;
        this.color = color;
        this.maxSteeringAngle = maxSteeringAngle;
        this.mass = mass;
        this.frontArea = frontArea;
        this.engineForce = engineForce;
        this.cameraHeight = cameraHeight;
        this.mirrorZ = mirrorZ;
    }
}


class CarGeneratorSettings {
    constructor(carSpeeds=[95, 120], maxNumberOfCars=[40, 20], minGaps=[4.5, 7], maxGaps=[25, 50],
    carColors=[0x004ecf, 0xf7f1fe, 0xff1010, 0x103030, 0x102020, 0x3e693e],
    carTypes=[[16.5, 4, 2.55], [4.66, 1.5, 1.90], [4.66, 1.5, 2.00], [3.57, 1.5, 1.4], [4.4, 1.5, 1.8], [4.2, 1.48, 1.789]]){
        this.carSpeeds = carSpeeds;
        this.maxNumberOfCars = maxNumberOfCars;
        this.minGaps = minGaps;
        this.maxGaps = maxGaps;
        this.carColors = carColors;
        this.carTypes = carTypes;
    }
}

class MapSettings {

    constructor(mainRoadLength = 400, mainRoadWidth = 3.7, mergingRoadLength=150,
            mergingRoadWidth = 3.4, mergeRoadStartOffset = 150, mergingFullLineLength=30, startingSpeed=50/3.6,
            grassColor=0x00ff80, skyColor=0x87CEEB) {
        this.mainRoadLength = mainRoadLength;
        this.leftLaneRoad = true;
        this.mainRoadWidth = mainRoadWidth;
        this.mergingRoadLength = mergingRoadLength;
        this.mergingRoadWidth = mergingRoadWidth;
        this.roadStart = -mainRoadLength/2;
        this.mergingFullLineLength = mergingFullLineLength;
        this.startingSpeed = startingSpeed;
        this.mergeRoadStartOffset = mergeRoadStartOffset;
        this.grassColor = grassColor;
        this.skyColor = skyColor;

        this.init();
    }

    init(){
        // Computed
        this.roadStart = -this.mainRoadLength/2;
        this.mainRoadCenter = -this.mainRoadWidth / 2;
        this.groundZ = -0.2;
        this.mergeRoadStart = this.roadStart + this.mergeRoadStartOffset;
        this.mergingRoadCenter = this.mainRoadCenter + this.mainRoadWidth /2.0 + this.mergingRoadWidth / 2.0;
    }
}

class StodulkyMapSetting extends MapSettings {
    constructor(){
        super()
        this.mainRoadLength = 650;
        this.mergeRoadStartOffset = 200;
        this.mergingRoadLength = 320;
        this.mergingFullLineLength = 30;
        this.init();
   }
}


class Level {
    constructor(ms, gs, cs, level=1, sucToPass=3){
        this.ms = ms;
        this.gs = gs;
        this.cs = cs;
        this.level = level;
        this.sucToPass = sucToPass;
    }
}


class Level1 extends Level {

    constructor(){
        const ms = new MapSettings(600, undefined, 350, undefined, undefined, undefined, 30 / 3.6,);
        const gs = new CarGeneratorSettings([85, 100], [30, 20], [15, 20], [35, 60], undefined, undefined);
        const cs = new CarSettings();
        super(ms, gs, cs, 1);
    }

}

class Level2 extends Level {

    constructor(){
        const ms = new MapSettings(600, undefined, 300, undefined, undefined, undefined, 30 / 3.6,
            0x50C878, 0xfcf0b1);
        const gs = new CarGeneratorSettings([85, 100], [30, 20], [10, 20], [30, 60], undefined, undefined);
        const cs = new CarSettings();
        super(ms, gs, cs, 2);
    }
}


class Level3 extends Level {

    constructor(){
        const ms = new MapSettings(600, undefined, 280, undefined, undefined, undefined, 40 / 3.6,
            0xE1C16E, 0xADD8E6);
        const gs = new CarGeneratorSettings([85, 110], [30, 30], [10, 15], [20, 40], undefined, undefined);
        const cs = new CarSettings();
        super(ms, gs, cs, 3);
    }
}

class Level4 extends Level {

    constructor(){
        const ms = new MapSettings(600, undefined, 250, undefined, undefined, undefined, 50 / 3.6,
            0x6f9c3a, 0xf7c5b2);
        const gs = new CarGeneratorSettings([90, 110], [30, 30], [5, 15], [15, 30], undefined, undefined);
        const cs = new CarSettings();
        super(ms, gs, cs, 4);
    }
}


class Level5 extends Level {

    constructor(){
        const ms = new MapSettings(600, undefined, 250, undefined, undefined, undefined, 45 / 3.6,
            0x541d6b, 0x00FFFF);
        const gs = new CarGeneratorSettings([90, 110], [50, 50], [4, 12], [20, 40], undefined, undefined);
        const cs = new CarSettings();
        super(ms, gs, cs, 5);
    }
}


class Level6 extends Level {

    constructor(){
        const ms = new MapSettings(600, undefined, 350, undefined, undefined, undefined, 25 / 3.6,
            0x2E8B57, 0x191970);
        const gs = new CarGeneratorSettings([100, 120], [50, 50], [4, 12], [20, 40], undefined, undefined);
        const cs = new CarSettings();
        super(ms, gs, cs, 6);
    }
}

class Level7 extends Level {

    constructor(){
        const ms = new MapSettings(600, undefined, 350, undefined, undefined, undefined, 30 / 3.6,
            0xB3B3B3, 0x4682B4);
        const gs = new CarGeneratorSettings([100, 120], [50, 50], [4, 8], [12, 28], undefined, undefined);
        const cs = new CarSettings();
        super(ms, gs, cs, 7);
    }
}

class Level8 extends Level {

    constructor(){
        const ms = new MapSettings(500, undefined, 150, undefined, undefined, undefined, 50 / 3.6,
            0xD4A017, 0x87CEEB);
        const gs = new CarGeneratorSettings([80, 120], [50, 50], [10, 14], [10, 30], undefined, undefined);
        const cs = new CarSettings();
        super(ms, gs, cs, 8);
    }
}

class Level9 extends Level {

    constructor(){
        const ms = new MapSettings(500, undefined, 130, undefined, undefined, undefined, 65 / 3.6,
            0x808080, 0x202020);
        const gs = new CarGeneratorSettings([80, 120], [50, 50], [10, 15], [12, 30], undefined, undefined);
        const cs = new CarSettings();
        super(ms, gs, cs, 9);
    }
}

class Level10 extends Level {

    constructor(){
        const ms = new MapSettings(600, undefined, 400, undefined, undefined, undefined, 70 / 3.6,
            0x4B0082, 0xb3d5e8, );
        const gs = new CarGeneratorSettings([105, 130], [50, 50], [4, 10], [8, 30], undefined, undefined);
        const cs = new CarSettings();
        super(ms, gs, cs, 10, 999);
    }
}

class LevelProvider {

    constructor(){
        this.levels = [Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8, Level9, Level10];
    }

    getLevel(level){
        if(level == 0 || level > this.levels.length){
            throw new Error("Invalid level number");
        }
        return new this.levels[level - 1]();
    }

    maxLevel(){
        return this.levels.length;
    }

}

class GameProgress {

    constructor(){
        this.level = 2;
        this.round = 0;
        this.totalFails = 0;
        this.totalWins = 0;
        this.load();
    }

    save(){
        localStorage.setItem("level", this.level);
        localStorage.setItem("round", this.round);
        localStorage.setItem("totalFails", this.totalFails);
        localStorage.setItem("totalWins", this.totalWins);
    }

    load(){
        //this.level =  +localStorage.getItem("level") || 1;
        //this.round = +localStorage.getItem("round") || 0;
        this.totalFails = +localStorage.getItem("totalFails") || 0;
        this.totalWins = +localStorage.getItem("totalWins") || 0;
    }

    increaseTotalFails(){
        this.totalFails += 1;
        this.save();
    }

    increaseTotalWins(){
        this.totalWins += 1;
        this.save();
    }

    increaseRounds(){
        this.round += 1;
        localStorage.setItem("round", this.round);
    }

    resetRound(){
        this.round = 0;
        localStorage.setItem("round", this.round);
    }

    increaseLevel(){
        this.level += 1;
        this.round = 0;
        localStorage.setItem("round", this.round);
        localStorage.setItem("level", this.level);

    }
}
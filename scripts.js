
class RearMirror {
    constructor(posVec, lookVec, resWidth=420, resHeight=360, fov=40,
            mirrorWidth=0.3, mirrorHeight=0.2){
        this.group = new THREE.Group();
        this.renderTarget = new THREE.WebGLRenderTarget(resWidth, resHeight);
        this.mirrorCamera = new THREE.PerspectiveCamera(fov, 1.0 * resWidth / resHeight, 0.1, 1000);

        const mirrorGeometry = new THREE.BoxGeometry(0.005, mirrorHeight, mirrorWidth);
        const mirrorMaterial = new THREE.MeshBasicMaterial({ map: this.renderTarget.texture, side: THREE.DoubleSide });
        this.mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        this.mirror.scale.x = -1;
        this.group.add(this.mirrorCamera);
        this.group.add(this.mirror);
        this.group.position.copy(posVec);
        const worldPosition = new THREE.Vector3();
        this.mirrorCamera.getWorldPosition(worldPosition);
        this.mirrorCamera.lookAt(worldPosition.add(lookVec));
    }

    render(scene, renderer){
        renderer.setRenderTarget(this.renderTarget);
        renderer.render(scene, this.mirrorCamera);
    }

}

class Car {
    constructor(speed, length, height, width, posX, posY, posZ, color) {
        this.group = new THREE.Group();
        this.speed = speed;
        this.posX = posX;
        this.posY = posY;
        this.bodyGeometry = new THREE.BoxGeometry(length, height, width);
        this.bodyMaterial = new THREE.MeshBasicMaterial( {color: color} );
        this.bodyMesh = new THREE.Mesh( this.bodyGeometry, this.bodyMaterial );
        this.bodyMesh.position.set(0, height / 2, 0);
        this.group.add(this.bodyMesh);
        this.group.position.set(posX, posY, posZ);
        this.width = width;
        this.length = length;

  }

  move(deltaTime, limitX, resetValue){
    const dX = this.speed * deltaTime / 1000;
    if(this.group.position.x > limitX){
        this.group.position.x -= resetValue;
        return;
    }
    this.group.position.x += dX;
  }

  isInCollision(otherBox){

    const box = new THREE.Box3(new THREE.Vector3(this.group.position.x - this.length / 2, 0, this.group.position.z - this.width / 2),
                                new THREE.Vector3(this.group.position.x + this.length / 2, 1, this.group.position.z + this.width / 2));
    return box.intersectsBox(otherBox);
   }
}

class ControllableCar extends Car {

    constructor(cs, cameraGroup, posZ) {
        super(0, cs.length, cs.bodyHeight, cs.width, 0, posZ, 0, cs.color);
        this.cameraGroup = cameraGroup;
        this.cs = cs;
        this.acc = 0;
        this.originalSpeed = 0;
        this.steeringAngle = 0;
        this.group.position.set(0, posZ, 0);
        this.cameraViewIndex = 0;
        this.originPos = cameraGroup.position.clone();
        cameraGroup.add(this.group);


        //Car roof Front
        this.carRoofGeo = new THREE.BoxGeometry(cs.roofLength, 0.05, cs.width);
        this.carRoofMesh = new THREE.Mesh( this.carRoofGeo, this.bodyMaterial );
        this.carRoofMesh.position.set(cs.roofLength/2, cs.height - 0.025, 0);
        this.group.add(this.carRoofMesh);

        //Car roof Rear
        this.carRearRoofGeo = new THREE.BoxGeometry(cs.rearRoofLength, 0.05, cs.width);
        this.carRearRoofMesh = new THREE.Mesh( this.carRearRoofGeo, this.bodyMaterial );
        this.carRearRoofMesh.position.set(-cs.rearRoofLength/2, cs.height - 0.025, 0);
        this.group.add(this.carRearRoofMesh);

        // Front columns
        const columnLengthX = cs.length /2 - cs.bonnetLength - cs.roofLength;
        const columnLength = Math.sqrt((cs.height - cs.bodyHeight)*(cs.height - cs.bodyHeight)
                + columnLengthX * columnLengthX);
        this.createSymmetricColumn(cs.length / 2 - cs.bonnetLength - columnLengthX / 2,
                        (cs.bodyHeight + cs.height) / 2,
                        -cs.width / 2  + 0.025, -Math.acos(columnLengthX / columnLength), columnLength);

        // Rear columns
        const rearColumnLengthX = cs.length /2 - cs.rearRoofLength;
        const rearColumnLength = Math.sqrt((cs.height - cs.bodyHeight)*(cs.height - cs.bodyHeight)
                + rearColumnLengthX * rearColumnLengthX);
        this.createSymmetricColumn(-cs.rearRoofLength - rearColumnLengthX / 2,
                        (cs.bodyHeight + cs.height) / 2,
                        -cs.width / 2  + 0.025, Math.acos(rearColumnLengthX / rearColumnLength), rearColumnLength);

        //Middle collumn
        this.createSymmetricColumn(-0.2,
                        (cs.bodyHeight + cs.height) / 2,
                        -cs.width / 2  + 0.025, Math.PI/2, -cs.bodyHeight + cs.height, 0.05, 0.15);
        this.createSymmetricColumn(-1.3,
                        (cs.bodyHeight + cs.height) / 2,
                        -cs.width / 2  + 0.025, Math.PI/2, -cs.bodyHeight + cs.height, 0.05, 0.15);




        this.leftMirror = new RearMirror(new THREE.Vector3(cs.mirrorX, cs.mirrorY, -cs.width/2 - 0.15),
                                     new THREE.Vector3(-1, 0, -0.3));
        this.group.add(this.leftMirror.group);
        this.rightMirror = new RearMirror(new THREE.Vector3(cs.mirrorX, cs.mirrorY, cs.width/2 + 0.15),
                                     new THREE.Vector3(-1, 0, +0.3));
        this.group.add(this.rightMirror.group);
        this.panoRearMirror = new RearMirror(new THREE.Vector3(cs.mirrorX - 0.35, cs.height - 0.08, 0),
                                     new THREE.Vector3(-1, -.1, 0), 420, 120, 16, 0.3, 0.07);
        this.group.add(this.panoRearMirror.group);

    }

    createSymmetricColumn(x, y, z, rotationZ, length, size=0.05, width=0.05){
        const columnGeo = new THREE.BoxGeometry(length, width, size);
        const columnMesh = new THREE.Mesh(columnGeo, this.bodyMaterial );
        columnMesh.position.set(x, y, z);
        columnMesh.rotation.z = rotationZ;
        const columnMesh2 = new THREE.Mesh(columnGeo, this.bodyMaterial );
        columnMesh2.position.set(x, y, -z);
        columnMesh2.rotation.z = rotationZ;
        this.group.add(columnMesh);
        this.group.add(columnMesh2);
    }

    accelerate(){
        this.speeding = 1;
        this.breaking = 0;
    }

    left(){
        if(this.speed < 1 && this.speed > -1){
            this.steeringAngle = this.cs.maxSteeringAngle;
            return;
        }
        this.steeringAngle = this.cs.maxSteeringAngle / (this.speed * .2);
    }

    right(){
        if(this.speed < 1 && this.speed > -1){
            this.steeringAngle = -this.cs.maxSteeringAngle;
            return;
        }
        this.steeringAngle  = -this.cs.maxSteeringAngle / (this.speed * 0.2);
    }

    resetSteering(){
        this.steeringAngle = 0;
    }

    setOriginalSpeed(speed){
        this.speed = speed;
        this.originalSpeed = speed;
    }

    toBreak(){
        this.speeding = 0;
        this.breaking = 1;
    }

    resetAcc(){
        this.speeding = 0;
        this.breaking = 0;
    }

    setCamera(camera){
        this.camera = camera;
    }

    toggleCameraView(){
        this.cameraViewIndex = (this.cameraViewIndex + 1) % 5;

        const worldPosition = new THREE.Vector3();
        switch(this.cameraViewIndex){
        case 0:
            this.camera.position.set(this.cs.cameraOffsetX, this.cs.cameraHeight, -0.3);
            this.camera.getWorldPosition(worldPosition);
            this.camera.lookAt(worldPosition.add(new THREE.Vector3(1, 0, 0)));
            break;
        case 1:
            this.camera.position.set(-6, 3, 0);
            this.camera.getWorldPosition(worldPosition);
            this.camera.lookAt(worldPosition.add(new THREE.Vector3(0.1, 0, 0)));
            break;
        case 2:
            this.camera.position.set(0, 8, 0);
            this.camera.getWorldPosition(worldPosition);
            this.camera.lookAt(worldPosition.add(new THREE.Vector3(0.01, -8, 0)));
            break;
        case 3:
            this.camera.position.set(0, 1, -5);
            this.camera.getWorldPosition(worldPosition);
            this.camera.lookAt(worldPosition.add(new THREE.Vector3(0, 0, 5)));
            break;
        case 4:
            this.camera.position.set(this.cs.cameraOffsetX, this.cs.cameraHeight, -0.3);
            this.camera.getWorldPosition(worldPosition);
            this.camera.lookAt(worldPosition.add(new THREE.Vector3(-2, 0, 0.1)));
            break;
        }
    }

    handleAcceleration(dt){
        const Cd = 0.3;
        const rho = 1.225;
        const Bmax = 8000;
        const dragFactor = 0.5 * Cd * rho * this.cs.frontArea / this.cs.mass;

        let engineForce = this.speeding * this.cs.engineForce * (1 - this.speed / this.cs.maxSpeed);
        let brakeForce = this.breaking * Bmax;

        let acceleration = (engineForce - brakeForce) / this.cs.mass - dragFactor * this.speed ** 2;


        this.speed += acceleration * dt;
    }

    airDragEffect(dt){
        this.speed -= (dragFactor * this.speed ** 2 + 0.05) * dt;
    }

    render(scene, renderer){
        this.leftMirror.render(scene, renderer);
        this.rightMirror.render(scene, renderer);
        this.panoRearMirror.render(scene, renderer);
    }

    moveGroup(deltaTime){
        const dt = deltaTime / 1000;
        this.handleAcceleration(dt);
        if(this.speed < 0){
            this.speed = 0;
        }

        let turningRadius = this.cs.wheelbase / Math.tan(this.steeringAngle);
        let angularVelocity = 0;
        if(turningRadius > 0.001 || turningRadius < -0.001){
            angularVelocity = this.speed / turningRadius;
        }

        this.cameraGroup.rotation.y += angularVelocity * dt;
        const rY = this.cameraGroup.rotation.y;

        const dX = this.speed * dt;
        const forward = new THREE.Vector3(1, 0, 0);

        forward.applyQuaternion(this.cameraGroup.quaternion);
        forward.multiplyScalar(dX);
        this.cameraGroup.position.add(forward);
    }

    reset(){
        this.resetAcc();
        this.resetSteering();
        this.speed = this.originalSpeed;
        this.cameraGroup.position.copy(this.originPos);
        this.cameraGroup.rotation.set(0, 0, 0);
    }

    checkCollision(cars, ms){
        const pFront = this.cameraGroup.position.x + this.length / 2;
        const pRear = this.cameraGroup.position.x - this.length / 2;
        const pLeft = this.cameraGroup.position.z - this.width / 2;
        const pRight = this.cameraGroup.position.z + this.width / 2;
        if(pLeft < ms.mainRoadCenter - ms.mainRoadWidth - ms.mainRoadWidth / 2 || pRight > ms.mergingRoadCenter + ms.mergingRoadWidth / 2
            || pFront > ms.mergeRoadStart + ms.mergingRoadLength && pRight > ms.mainRoadCenter + ms.mainRoadWidth / 2){
            return 2;
        }

        const box = new THREE.Box3(new THREE.Vector3(pRear, 0, pLeft),
                                new THREE.Vector3(pFront, 1, pRight));

        for(var i = 0; i < cars.length; i++){
            if(cars[i].isInCollision(box)){
            return 2;
            }
        }

        if(pFront > ms.roadStart + ms.mainRoadLength){
            return 1;
        }
    }
}

class GameSession {

    constructor(level, gameProgress){
        this.gameProgress = gameProgress;
        this.initScene();
        this.initLevel(level.ms, level.gs, level.cs);
        this.level = level;

        // ui
        this.uiSpeedLabel = document.getElementById("id_speed");
        this.uiLevelLabel = document.getElementById("id_level");
        this.uiRoundLabel = document.getElementById("id_round");
        this.uiNeededLabel = document.getElementById("id_needed");
    }

    initScene(){
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color("#87CEEB");

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.renderer.setSize(window.innerWidth,  window.innerHeight);
    }

    initLevel(ms, gs, cs){
        this.scene.background = new THREE.Color(ms.skyColor);
        const grassGeometry = new THREE.BoxGeometry(ms.mainRoadLength, 1, ms.mainRoadLength);
        const grassMaterial = new THREE.MeshBasicMaterial( {color: ms.grassColor} );
        this.gressMesh = new THREE.Mesh( grassGeometry, grassMaterial );
        this.gressMesh.position.set(0, -1, 0);
        this.scene.add(this.gressMesh);

        this.roadGroup = new THREE.Group();
        generateMainRoad(this.roadGroup, ms);
        this.scene.add(this.roadGroup);

        this.carGroup = new THREE.Group();

        this.controllableCar = createCar(this.carGroup, cs, ms);

        this.scene.add(this.carGroup);
        this.carsGroup = new THREE.Group();
        this.cars = generateCars(this.scene, this.carsGroup, ms, gs);
        this.scene.add(this.carsGroup);
        this.camera = this.controllableCar.camera;
    }

    setLevel(level){
        this.level = level;
        this.initLevel(level.ms, level.gs, level.cs);
    }

    removeLevelItems(){
        this.scene.remove(this.gressMesh);
        this.scene.remove(this.roadGroup);
        this.scene.remove(this.carGroup);
        this.scene.remove(this.carsGroup);
    }

    render(){
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
        this.controllableCar.render(this.scene, this.renderer);
        this.updateUI();
    }

    move(dt){
        this.cars.forEach((car) => car.move(dt, this.level.ms.roadStart + this.level.ms.mainRoadLength, this.level.ms.mainRoadLength));
        this.controllableCar.moveGroup(dt);
    }

    checkGameProgress(){
        return this.controllableCar.checkCollision(this.cars, this.level.ms);;
    }

    resetLevel(){
        this.gameProgress.increaseTotalFails();
        this.gameProgress.resetRound();
        this.controllableCar.reset();
    }

    updateUI(){
        this.uiSpeedLabel.innerHTML = (this.controllableCar.speed  * 3.6).toFixed();
        this.uiLevelLabel.innerHTML = this.level.level;
        this.uiNeededLabel.innerHTML = this.level.sucToPass;
        this.uiRoundLabel.innerHTML = (this.gameProgress.round + 1);
    }

}

function createBarriers(group, start, length, posY){
    const poleMat = new THREE.MeshBasicMaterial( {color: 0xC0D0C0} );
    const poleMat2 = new THREE.MeshBasicMaterial( {color: 0xD0E5D5} );
    const geometryPole = new THREE.BoxGeometry(0.15, 0.8, 0.15);
    const geometryPlate = new THREE.BoxGeometry(4, 0.4, 0.10);
    for(var i =0; i < length; i+= 4){
        const poleMesh = new THREE.Mesh(geometryPole, poleMat );
        const plateMesh = new THREE.Mesh(geometryPlate, poleMat2 );
        group.add(poleMesh);
        group.add(plateMesh);
        const x = start + i;
        poleMesh.position.set(x, 0.0, posY - .15/2);
        plateMesh.position.set(x + 2, 0.0, posY - .15/2);
    }
}

function createFullLine(group, start, length, posY, thickness=0.2){
    const laneMat = new THREE.MeshBasicMaterial( {color: 0xF0F0F0} );
    const geometryWhite = new THREE.BoxGeometry(length, 1.01, thickness);
    const lineMash = new THREE.Mesh( geometryWhite, laneMat );
    lineMash.position.set(start + length / 2, -0.9, posY);
    group.add(lineMash);
}

function createDashLine(group, start, length, posY, thickness=0.1, dashLineLength=1.6){
    const geometryRightDashWhite = new THREE.BoxGeometry(dashLineLength, 1.01, 0.1);
    const laneMat = new THREE.MeshBasicMaterial( {color: 0xF0F0F0} );
    var leftDashX = start + dashLineLength;
    while(leftDashX < start + length){
        const lineMesh = new THREE.Mesh( geometryRightDashWhite, laneMat );
        lineMesh.position.set(leftDashX, -0.9, posY);
        leftDashX += 2*dashLineLength;
        group.add(lineMesh);
    }
}

function createRoad(group, start, length, center, width){
    const geometry = new THREE.BoxGeometry(length, 1, width);
    const material = new THREE.MeshBasicMaterial( {color: 0x878787} );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(start + length / 2, -0.9, center);
    group.add(mesh);
}

function createGoal(group, posX, posZ, width){
    const geometry = new THREE.BoxGeometry(1, 5, width);
    const material = new THREE.MeshBasicMaterial( {color: 0x10ff10} );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(posX, 2, posZ);
    group.add(mesh);
}

function createConcreateBlock(group, posX, posZ, width){
    const concreateMat = new THREE.MeshBasicMaterial( {color: 0xC0D0C0} );
    const geometryLaneEnd = new THREE.BoxGeometry(1, 2, width);
    const laneEndMesh = new THREE.Mesh( geometryLaneEnd, concreateMat );
    laneEndMesh.position.set(posX, 0, posZ);
    group.add(laneEndMesh);
}

function generateMainRoad(group, ms){
    createRoad(group, ms.roadStart, ms.mainRoadLength, ms.mainRoadCenter, ms.mainRoadWidth);
    createRoad(group, ms.roadStart, ms.mainRoadLength, ms.mainRoadCenter - ms.mainRoadWidth, ms.mainRoadWidth);

    // Main road Left full line
    createFullLine(group, ms.roadStart, ms.mainRoadLength,  ms.mainRoadCenter - ms.mainRoadWidth - ms.mainRoadWidth/2, 0.2);

    // Main road Right full line before merge
    createFullLine(group, ms.roadStart, ms.mergeRoadStart - ms.roadStart + ms.mergingFullLineLength,
        ms.mainRoadCenter + ms.mainRoadWidth / 2.0, 0.10);

    // Main road right after merge
    createFullLine(group, ms.mergeRoadStart + ms.mergingRoadLength, ms.mainRoadLength - (ms.mergeRoadStart-ms.roadStart)
        - ms.mergingRoadLength,  ms.mainRoadCenter + ms.mainRoadWidth / 2.0, 0.2);
    // main Road center
    createDashLine(group, ms.roadStart, ms.mainRoadLength,  ms.mainRoadCenter - ms.mainRoadWidth / 2.0, 6.3);

    createDashLine(group, ms.mergeRoadStart + ms.mergingFullLineLength, ms.mergingRoadLength,
        ms.mainRoadCenter + ms.mainRoadWidth / 2.0);

    // barriers Main Road
    createBarriers(group, ms.roadStart, ms.mainRoadLength, ms.mainRoadCenter - ms.mainRoadWidth - ms.mainRoadWidth / 2.0);
    createBarriers(group, ms.roadStart, ms.mergeRoadStart - ms.roadStart, ms.mainRoadCenter + ms.mainRoadWidth /2.0);
    createBarriers(group, ms.mergeRoadStart + ms.mergingRoadLength, ms.mainRoadLength - (ms.mergeRoadStart-ms.roadStart)
        - ms.mergingRoadLength, ms.mainRoadCenter + ms.mainRoadWidth /2.0);

    // Merging lane
    createRoad(group, ms.mergeRoadStart, ms.mergingRoadLength, ms.mergingRoadCenter, ms.mergingRoadWidth);
    createBarriers(group, ms.mergeRoadStart, ms.mergingRoadLength, ms.mergingRoadCenter + ms.mergingRoadWidth / 2.0 + 0.1);
    createFullLine(group, ms.mergeRoadStart, ms.mergingRoadLength, ms.mergingRoadCenter + ms.mergingRoadWidth / 2.0);

    // Lane end
    createConcreateBlock(group, ms.mergeRoadStart + ms.mergingRoadLength, ms.mergingRoadCenter, ms.mergingRoadWidth);

    createGoal(group, ms.roadStart + ms.mainRoadLength,
        ms.mainRoadCenter - ms.mainRoadWidth / 2.0, 2 * ms.mainRoadWidth);
}

function createCar(group, cs, ms){
    const renWidth = window.innerWidth;
    const renHeight = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(90, renWidth/renHeight, 0.01, 1000);
    const worldPosition = new THREE.Vector3();
    camera.position.set(cs.cameraOffsetX, cs.cameraHeight, -0.3);
    camera.getWorldPosition(worldPosition);
    camera.lookAt(worldPosition.add(new THREE.Vector3(1, 0, 0)));
    group.add(camera);

    group.position.set(ms.mergeRoadStart, 0, ms.mergingRoadCenter);
    var controllableCar = new ControllableCar(cs, group, 0);
    controllableCar.setOriginalSpeed(ms.startingSpeed);
    controllableCar.setCamera(camera);
    return controllableCar;
}

function generateCars(scene, group, ms, gs){
    const colors = gs.carColors;
    var cars = [];
    for(var j = 0; j < gs.maxNumberOfCars.length; j++){
        var x = 0;
        for(var i = 0; i < gs.maxNumberOfCars[j]; i++){
            var color = colors[Math.floor(Math.random() * colors.length)];
            var type = gs.carTypes[Math.floor(Math.random() * gs.carTypes.length)];
            const yOffset = Math.random() * 0.4 - 0.2;
            var car = new Car(gs.carSpeeds[j] / 3.6,
                type[0], type[1], type[2], ms.mergeRoadStart - x - type[0]/2, ms.groundZ,
                 -ms.mainRoadWidth * j + ms.mainRoadCenter + yOffset, color);
            x += type[0] + Math.floor(gs.minGaps[j] + Math.random() * gs.maxGaps[j]);
            group.add(car.group);
            cars.push(car);
            if(x > ms.mainRoadLength){
                break;
            }
        }
    }
    return cars;
}

function initWorld(levelProvider, gameProgress){
    const level = levelProvider.getLevel(gameProgress.level);
    const game = new GameSession(level, gameProgress);


    let currentT = 0;
    let lastTime = performance.now();

    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let paused = false;

    const content3d = document.getElementById('content3d');
    content3d.appendChild(game.renderer.domElement);


    document.addEventListener("keydown", (event) => {
        if (event.key === "w" || event.key === "W") moveForward = true;
        if (event.key === "s" || event.key === "S") moveBackward = true;
        if (event.key === "a" || event.key === "A") moveLeft = true;
        if (event.key === "d" || event.key === "D") moveRight = true;
        if (event.key === "r" || event.key === "R") game.resetLevel();
        if (event.key === "p" || event.key === "P") paused = !paused;
        if (event.key === "c" || event.key === "C") game.controllableCar.toggleCameraView();
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "w" || event.key === "W") moveForward = false;
        if (event.key === "s" || event.key === "S") moveBackward = false;
        if (event.key === "a" || event.key === "A") moveLeft = false;
        if (event.key === "d" || event.key === "D") moveRight = false;
    });


    var levelEnded = false;


    function success(car){
        gameProgress.increaseTotalWins();
        gameProgress.increaseRounds();
        if(gameProgress.round >= level.sucToPass){
            if(gameProgress.level < levelProvider.maxLevel()){
                gameProgress.increaseLevel();
            }else{
                gameProgress.resetRound();
            }
            game.removeLevelItems();
            game.setLevel(levelProvider.getLevel(gameProgress.level));

        }
        car.reset();
    }

    function animate() {
        requestAnimationFrame(animate);
        const now = performance.now();
        const deltaTime = now - lastTime;
        lastTime = now;
        if(paused){
         return;
        }

        if (moveForward) game.controllableCar.accelerate();
        if (moveBackward) game.controllableCar.toBreak();
        if (!moveForward && !moveBackward) game.controllableCar.resetAcc();

        if (moveLeft) game.controllableCar.left();
        if (moveRight) game.controllableCar.right();
        if (!moveLeft && !moveRight) game.controllableCar.resetSteering();

        game.move(deltaTime);
        game.render();
        const ret = game.checkGameProgress();
        if(ret == 1){
            success(game.controllableCar);
        }else if(ret == 2){
            game.resetLevel();
        }

        lastTime = now;
    }

    animate();
}

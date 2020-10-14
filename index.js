//canvas
let canvas=document.querySelector('canvas');
let ctx=canvas.getContext('2d');

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let x=canvas.width/2;
let y=canvas.height/2;


//player class
class Player{
    constructor(x,y,radius,color){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
    };
    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,false);
        ctx.fillStyle=this.color;
        ctx.fill();
    }
}

//projectile class
class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,false);
        ctx.fillStyle=this.color;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x=this.x+this.velocity.x
        this.y=this.y+this.velocity.y
    }
}

//enemy class
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,false);
        ctx.fillStyle=this.color;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x=this.x+this.velocity.x,
        this.y=this.y+this.velocity.y
    };
}

//variables
let player=new Player(x,y,10,'white');
let projectiles=[];
let enemies=[];
let particles=[];
let score=0;

//init function
function init(){
    player=new Player(x,y,10,'white');
    projectiles=[];
    enemies=[];
    particles=[];
    score=0;
}

//particle class
let friction=0.99;
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.alpha=1
    }

    draw(){
        ctx.save();
        ctx.globalAlpha=this.alpha
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,false);
        ctx.fillStyle=this.color;
        ctx.fill();
        ctx.restore();
    }

    update(){
        this.draw();
        this.velocity.x*=friction,
        this.velocity.y*=friction,
        this.x=this.x+this.velocity.x,
        this.y=this.y+this.velocity.y,
        this.alpha-=0.01
    };
}

//create random enemy
function createEnemy(){
    setInterval(() => {
        let radius=Math.random()*(29-5)+5;
        let x,y;
        if(Math.random()<0.5){
            x=Math.random()<0.5 ? 0-radius : canvas.width + radius;
            y=Math.random()*canvas.height;
        }
        else{
            x=Math.random()*canvas.width ;
            y=Math.random()<0.5 ? 0-radius : canvas.height+radius ; 
        }
    
        let color=`hsl(${Math.random()*360},50%,50%)`;
      
        let angle=Math.atan2(canvas.height/2-y,canvas.width/2-x);
        let velocity={
            x:Math.cos(angle),
            y:Math.sin(angle),
        }
        enemies.push(new Enemy(x,y,radius,color,velocity));
        
    }, 1400);
}

//main animation function
function animation(){
    let animationId=requestAnimationFrame(animation);

    ctx.fillStyle='rgba(0,0,0,0.1)';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    //draw player
    player.draw();
    //update score
    document.getElementById('score').innerHTML=score;

    //remove projectile which are outside of screen
    projectiles.forEach((Projectile,index)=>{
        Projectile.update();
        if(Projectile.x-Projectile.radius<0 ||
             Projectile.x-Projectile.radius>canvas.width ||
             Projectile.y-Projectile.radius<0 ||
             Projectile.y-Projectile.radius>canvas.height){
            setTimeout(() => {
                projectiles.splice(index,1);
            }, 0);
        }
    });

    //explosion enimation controll
    particles.forEach((particle,index)=>{
        particle.update();
        if(particle.alpha<=0){
            setTimeout(() => {
                particles.splice(index,1);
            }, 0);
        }
    })

    //enemy and projectile colloision
    enemies.forEach((enemy,Eindex)=>{
        enemy.update();

        let dist=Math.hypot(player.x-enemy.x,player.y-enemy.y);
        if(dist-player.radius-enemy.radius<1){
            cancelAnimationFrame(animationId);
            document.getElementById('finalScore').innerHTML=score;
            document.getElementById('model').style.display='flex';

        }

        projectiles.forEach((Projectile,Pindex)=>{
            let dist=Math.hypot(Projectile.x-enemy.x,Projectile.y-enemy.y);
            if(dist-enemy.radius-Projectile.radius<1){

                //explosion efect
                for (let i=0 ; i<enemy.radius*2 ; i++){
                    particles.push(new Particle(Projectile.x,Projectile.y,Math.random()*1,enemy.color,{
                        x:(Math.random()-0.5)*(Math.random()*6),
                        y:(Math.random()-0.5)*(Math.random()*6)
                    }))
                }

                //shrink enemy or remove
                if(enemy.radius-10>5){

                    gsap.to(enemy,{
                        radius:enemy.radius-10,
                    })
                    setTimeout(() => {
                        projectiles.splice(Pindex,1);
                    }, 0);
                    score+=50;
                }
                else{
                    score+=100;
                    setTimeout(() => {
                        enemies.splice(Eindex,1);
                        projectiles.splice(Pindex,1);
                    }, 0);
                }
                
            }
        });
    });


}

//firing
addEventListener('click',(event)=>{
    let angle=Math.atan2(event.clientY-y,event.clientX-x);
   
    let velocity={
        x:Math.cos(angle)*5,
        y:Math.sin(angle)*5,
    }
    projectiles.push(new Projectile(x,y,5,'white',velocity));
    
});

// start the game
let startGame=document.getElementById('startGame');
startGame.addEventListener('click',()=>{
    init();
    document.getElementById('model').style.display='none';
    animation();
    createEnemy();
});

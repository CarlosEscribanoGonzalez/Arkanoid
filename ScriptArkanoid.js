//LIENZO, CONTEXTO E IMÁGENES:
var lienzo = document.getElementById("canvas");
var ctx = lienzo.getContext("2d");
ctx.fillStyle = "blue";
ctx.fillRect(0, 0, canvas.width, canvas.height);
var imgPelota = new Image();
imgPelota.src = "Sprites/ball.png";
var imgRaqueta = new Image();
imgRaqueta.src = "Sprites/racket.png";

var puntuaciones = document.getElementById("puntuaciones");
var ctxp = puntuaciones.getContext("2d");
ctxp.strokeStyle = "#B08000";
ctxp.font = "40pt Times New";
ctxp.strokeText(0, 30, 42);

//VARIABLES AUXILIARES:
var x = 1; 
var y = 75;
var index = 0;
var colores = ["gray", "red", "yellow", "blue", "purple", "green"];
var dureza = [3, 3, 2, 2, 1, 1];
var collided = false; //Indica si un ladrillo ya ha sido golpeado para que no se cuenten dos colisiones a la vez
var canMove = false;
var velocidad = 1;
var puntuacion = 0;
var puntosHastaAumento = 0; //Puntos hasta aumentar la velocidad de la pelota
var finDelJuego = false;

//ELEMENTOS DEL JUEGO:
var pelota = new Pelota();

var ladrillos = new Array(60);
for(var i = 0; i < 6; i++)
{
	x = 1;
	for(var j = 0; j < 10; j++)
	{
		ladrillos[index] = new Ladrillo(x, y, colores[i], dureza[i]);
		x += 40;
		index++;
	}
	y += 11;
}

var raqueta = new Raqueta();

//AUDIO:
var rebote = document.getElementById("rebote");
var romperLadrillo = document.getElementById("romperLadrillo");
var gameOverAudio = document.getElementById("gameOver");
var gamePassed = document.getElementById("gamePassed");

//CLASE PELOTA:
function Pelota()
{
	this.x = 195;
	this.y = 300;
	this.size = 10;
	this.toRight = true;
	this.toUp = true;
	
	this.pintarPelota = function()
	{
		ctx.drawImage(imgPelota, this.x, this.y, this.size, this.size);
	}

	this.actualizarPelota = function()
	{
		this.checkCollision();
		if(this.toRight)
		{
			this.x += velocidad;
		}
		else
		{
			this.x -= velocidad;
		}
		
		if(this.toUp)
		{
			this.y -= velocidad;
		}
		else
		{
			this.y += velocidad;
		}
	}
	
	this.checkCollision = function()
	{
		if(this.x < 0)
		{
			this.toRight = true;
			rebote.play();
		}
		else if(this.x + this.size > lienzo.clientWidth)
		{
			this.toRight = false;
			rebote.play();
		}
		else if(this.y < 0)
		{
			this.toUp = false;
			rebote.play();
		}
		else if(this.y + this.size > lienzo.clientHeight)
		{
			gameOver();
		}
	}	
}

//CLASE LADRILLO:
function Ladrillo(xPos, yPos, c, dureza)
{
	this.x = xPos;
	this.y = yPos;
	this.width = 38;
	this.height = 10;
	this.vivo = true;
	this.color = c;
	this.vida = dureza;
	
	this.pintarLadrillo = function()
	{
		if(this.vivo)
		{
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}
	
	this.comprobarColision = function()
	{
		if(this.vivo && !collided)
		{
			if((pelota.y <= this.y + this.height) && (pelota.y + pelota.size >= this.y) && (pelota.x <= this.x + this.width) && (pelota.x + pelota.size >= this.x))
			{
				this.vida--;
				
				if(this.vida === 0)
				{
					this.vivo = false;
					actualizarPuntuacion();
					romperLadrillo.play();
				}
				else if(this.vida === 1)
				{
					this.color = "white";
					rebote.play();
				}
				else if(this.vida === 2)
				{
					this.color = "light" + this.color;
					rebote.play();
				}
				
				collided = true;
				//Si no golpea en el lateral cambia de dirección en el eje y
				if(pelota.y + pelota.size <= this.y+3 || pelota.y >= this.y + this.height - 3)
				{
					pelota.toUp = !pelota.toUp;
				}
				else //Si golpea en el lateral cambia de dirección en el eje x
				{
					pelota.toRight = !pelota.toRight;
				}
			}
		}
	}
}

//CLASE RAQUETA:
function Raqueta()
{
	this.x = 160;
	this.y = 350;
	this.width = 70;
	this.height = 15;
	
	this.pintarRaqueta = function()
	{
		ctx.drawImage(imgRaqueta, this.x, this.y, this.width, this.height);
	}
	
	this.comprobarColision = function()
	{
		if(pelota.x <= this.x + this.width && pelota.x + pelota.size >= this.x && pelota.y + pelota.size >= this.y && pelota.y <= this.y + this.height/2)
		{
			pelota.toUp = true;
			rebote.play();
			if(pelota.x + pelota.size/2 > this.x + this.width/2) //Si la pelota golpea en la parte derecha de la raqueta
			{
				pelota.toRight = true;
			}
			else
			{
				pelota.toRight = false;
			}
		}
	}
}

//CONTROL DEL JUEGO:
imgPelota.onload = function()
{
	requestAnimationFrame(actualizar);
}

lienzo.onmousedown = function(raton)
{
	var xPos = parseInt(raton.clientX - lienzo.getBoundingClientRect().left - 10); //Se tiene también en cuenta el grosor del borde
	var yPos = parseInt(raton.clientY - lienzo.getBoundingClientRect().top - 10);
	if(xPos >= raqueta.x && xPos <= raqueta.x + raqueta.width && yPos >= raqueta.y && yPos <= raqueta.y + raqueta.height)
	{
		canMove = true;
	}
}

window.onmouseup = function()
{
	canMove = false;
}

lienzo.onmousemove = function(raton)
{
	var xPos = parseInt(raton.clientX - lienzo.getBoundingClientRect().left - 10);
	if(xPos - 35 >= 0 && xPos - 35 + raqueta.width <= lienzo.clientHeight && canMove)
	{
		raqueta.x = xPos - 35;
	}
}

function actualizar()
{
	repintado();
	pelota.actualizarPelota();
	raqueta.comprobarColision();
	
	if(!finDelJuego) requestAnimationFrame(actualizar);
}

function repintado()
{
	collided = false;
	ctx.clearRect(0, 0, lienzo.clientWidth, lienzo.clientHeight);
	pelota.pintarPelota();
	for(var i = 0; i < ladrillos.length; i++)
	{
		ladrillos[i].comprobarColision();
		ladrillos[i].pintarLadrillo();
	}
	raqueta.pintarRaqueta();
}

function actualizarPuntuacion()
{
	puntuacion++;
	puntosHastaAumento++;
	ctxp.clearRect(0,0,100,50);
	ctxp.strokeText(puntuacion, 30, 42);
	if(puntosHastaAumento === 10)
	{
		velocidad++;
		puntosHastaAumento = 0;
	}
	if(puntuacion === ladrillos.length)
	{
		gameCompleted();
	}
}

function gameOver()
{
	ctx.fillStyle = "red";
	ctx.font = "50pt Times New";
	ctx.fillText("GAME OVER", 0, 200);
	gameOverAudio.play();
	finDelJuego = true;
}

function gameCompleted()
{
	gamePassed.play();
	ctx.fillStyle = "#67FF16";
	ctx.font = "30pt Times New";
	ctx.fillText("CONGRATULATIONS!", 0, 200);
	ctx.fillText("GAME COMPLETED", 15, 250);
	finDelJuego = true;
}
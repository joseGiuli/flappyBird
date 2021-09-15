function novoElemento(tagName, className) { 
    const elem = document.createElement(tagName) // cria um elemento no HTML à partir do nome da tag
    elem.className = className // adiciona a classe CSS para esse elemento
    return elem 
}

function Barreira(reversa = false) { 
    this.elemento = novoElemento('div', 'barreira') // cria um elemento div com classe barreira
    const borda = novoElemento('div', 'borda') 
    const corpo = novoElemento('div', 'corpo') 

    this.elemento.appendChild(reversa ? corpo : borda) // reversa true -> acrescenta corpo, reversa false -> acrescenta borda
    this.elemento.appendChild(reversa ? borda : corpo) // reversa true -> acrescenta borda // reversa false -> acrescenta corpo
    this.setAltura = altura => corpo.style.height = `${altura}px` // altura dos canos
}

function ParDeBarreiras(altura, abertura, x) { 
    this.elemento = novoElemento('div', 'par-de-barreiras') 

    this.superior = new Barreira(true) 
    this.inferior = new Barreira(false) 

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura) // Calcular altura Superior RANDOM
        const alturaInferior = altura - abertura - alturaSuperior // Calcular cano inferior 
        this.superior.setAltura(alturaSuperior) 
        this.inferior.setAltura(alturaInferior) 
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]) // get no x
    this.setX = x => this.elemento.style.left = `${x}px` // Alterar x
    this.getLargura = () => this.elemento.clientWidth 
    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) { // Adicionar animações nas barreiras
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura), 
        new ParDeBarreiras(altura, abertura, largura + espaco), 
        new ParDeBarreiras(altura, abertura, largura + espaco * 2), 
        new ParDeBarreiras(altura, abertura, largura + espaco * 3) 
    ]

    const deslocamento = 3 // deslocamento em px

    this.animar = () => { 
        this.pares.forEach(par => { 
            par.setX(par.getX() - deslocamento) // getX pega a posição LEFT das barreiras e transforma em um número inteiro, subtraindo do descolamento.

            if(par.getX() < -par.getLargura()) { 
                par.setX(par.getX() + espaco * this.pares.length) // Multiplica o valort do espaço pela quantidade de elementos do array
                // quando acabarem os canos na tela, move até a posição inicial do 4 cano
                par.sortearAbertura() 
                // sort buraco nos canos
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio 
                && par.getX() < meio // verifica se passou o meio
            if(cruzouOMeio) notificarPonto() 
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false // variável de tecla pressionada

    this.elemento = novoElemento('img', 'passaro') // Imagem do pássaro
    this.elemento.src = 'passaro.png' 

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px` 

    window.onkeydown = e => voando = true // quando clicar em qualquer tecla, voando = true
    window.onkeyup = e => voando = false // soltando a tecla, voando = false

    this.animar = () => { 
        const novoY = this.getY() + (voando ? 8 : -5) // voando = true: + 8 na altura do pássaro, se não - 5
        const alturaMaxima = alturaJogo - this.elemento.clientHeight 

        if (novoY <= 0) { // verificação para o pássaro não cair no limbo
            this.setY(0)
        } else if (novoY >= alturaMaxima) { // verificação para o pássaro não passar do topo da tela
            this.setY(alturaMaxima)
        } else { // se ele não passou do teto, nem do chão, set na posição atual dele
            this.setY(novoY)
        }
    }
    
    this.setY(alturaJogo / 2) // altura do pássaro no início do jogo
}

function Progresso() { 
    this.elemento = novoElemento('span', 'progresso') 
    this.atualizarPontos = pontos => { 
        this.elemento.innerHTML = pontos 
    }
    
    this.atualizarPontos(0) // Inicia o jogo com 0 pontos
}

function estaoSobrepostos(elementoA, elementoB) { // func de colisão
    const a = elementoA.getBoundingClientRect() // retângulo A
    const b = elementoB.getBoundingClientRect() // retângulo B
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    // se o lado direito de a em relação ao left for maior ou igual ao lado esquerdo de b em relação ao left, houve colisão horizontal!
    // se o lado direito de b em relação ao left for maior ou igual ao lado esquerdo de a em relação ao left , houve colisão horizontal!
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    // se a parte inferior de a em relação ao topo for maior que a parte superior de b em relação ao topo, houve colisão vertical!
    // se a parte inferior de b em relação ao topo for maior que a parte superior de a em relação ao topo, houve colisão vertical!

    return horizontal && vertical 
}

function colidiu(passaro, barreiras) { 
    let colidiu = false 

    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu) { // Se não houver colidido
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento

            // verifica se houve colisão 
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
            // quando acontecer a colisão == true
        }
    })
    return colidiu  // GAME OVER
}

function GameOver() {
    this.elemento = novoElemento('span', 'game-over')
    this.elemento.innerHTML = 'Game Over' 
}

function RestartMessage() {
    this.elemento = novoElemento('span', 'restart')
    this.elemento.innerHTML = 'Press F5 to restart' 
}

function FlappyBird() { 
    let pontos = 0 

    const areaDoJogo = document.querySelector('[wm-flappy]') 
    const altura = areaDoJogo.clientHeight 
    const largura = areaDoJogo.clientWidth 
    const progresso = new Progresso()
    const passaro = new Passaro(altura)
    const fimJogo = new GameOver()
    const restart = new RestartMessage()
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))

    // Elementos do jogo
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) { 
                clearInterval(temporizador) 
                areaDoJogo.appendChild(fimJogo.elemento) // Ao colidir
                areaDoJogo.appendChild(restart.elemento) 
            }
        }, 20)
    }
}

new FlappyBird().start() 
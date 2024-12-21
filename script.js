function llamarPerfumes() {
    fetch("perfumes.json")
        .then(res => res.json())
        .then(perfumes => principal(perfumes))
        .catch(err => Swal.fire({
            title: 'Error!',
            text: err,
            icon: 'error',
            confirmButtonText: 'Cerrar'
        }))
}

llamarPerfumes()

function principal(perfumes) {

    let carrito = recuperarStorage()

    agregarEnCarrito(carrito)

    crearTarjetas(perfumes)

    let inputSearch = document.getElementById("search")

    inputSearch.addEventListener("input", (e) => filtrarYMostrar(e, perfumes))

    let botonesPerfumes = document.getElementsByClassName("card__button")

    for (const botonPerfume of botonesPerfumes) {
        botonPerfume.addEventListener("click", (e) => productoAlCarrito(e, perfumes))
    }

    let botonCarrito = document.getElementById("menu__carrito")

    botonCarrito.addEventListener("click", ocultarCarrito)

    let botonCompra = document.getElementById("finalizarCompra")
    botonCompra.addEventListener("click", finalizarCompra)

}

function crearTarjetas(perfumes) {

    let ofertas = document.getElementById("ofertas")

    ofertas.innerHTML = ""

    perfumes.forEach(perfume => {
        ofertas.innerHTML += `
        <div class="ofertas__card" id="occ${perfume.nombre}">
            <img class="card__img" src="${perfume.img}" alt="">
            <h3 class="card__title">${perfume.nombre.toUpperCase()}</h3>
            <p class="card__price">${perfume.precio}$</p>
            <button class="card__button" id="${perfume.nombre}">Agregar al carrito</button>
        </div>
        `
    })

}

function productoAlCarrito(event, perfumes) {

    let carrito = recuperarStorage()

    let id = event.target.id

    let perfumeOriginal = perfumes.find(perfume => perfume.nombre == id)

    let indicePerfumeCarrito = carrito.findIndex(perfume => perfume.nombre == id)

    if (indicePerfumeCarrito == -1) {
        carrito.push({
            nombre: perfumeOriginal.nombre,
            precio: Number(perfumeOriginal.precio),
            unidades: Number(1),
            subtotal: Number(perfumeOriginal.precio),
            img: perfumeOriginal.img
        })
    } else {
        carrito[indicePerfumeCarrito].unidades++
        carrito[indicePerfumeCarrito].subtotal = carrito[indicePerfumeCarrito].precio * carrito[indicePerfumeCarrito].unidades
    }

    agregarEnCarrito(carrito)

    guardarStorage(carrito)

    let totalSumado = calcularTotal(carrito)
    total(totalSumado)
}

function agregarEnCarrito(carrito) {

    let sectionCarrito = document.getElementById("carrito")

    sectionCarrito.innerHTML = ""

    carrito.forEach(perfume => {
        sectionCarrito.innerHTML += `
        <div class="carrito" id="tar${perfume.nombre}">
            <div class="carrito__container-img">
                <img src="${perfume.img}" alt="" class="carrito_img">
            </div>
            <p class="carrito__datos">${perfume.nombre.toUpperCase()}</p>
            <p class="carrito__datos">${perfume.precio}</p>
            <div class="carrito__unidades">
                <button class="carrito__unidades-button menos" id="men${perfume.nombre}">-</button>
                <p class="carrito__datos">${perfume.unidades}</p>
                <button class="carrito__unidades-button mas" id="mas${perfume.nombre}">+</button>
            </div>
            <p class="carrito__datos">${perfume.subtotal}</p>
            <button id="del${perfume.nombre}" class="carrito__delete">Eliminar</button>
        </div>
    `
        let botonMenosUnidades = document.getElementsByClassName("menos")
        for (const botonMenos of botonMenosUnidades) {
            botonMenos.addEventListener("click", restarUnidad)
        }


        let botonMasUnidades = document.getElementsByClassName("mas")
        for (const botonMas of botonMasUnidades) {
            botonMas.addEventListener("click", sumarUnidad)
        }
        let botonesEliminar = document.getElementsByClassName("carrito__delete")

        for (const botonEliminar of botonesEliminar) {
            botonEliminar.addEventListener("click", eliminar)
        }
    })


    let totalSumado = calcularTotal(carrito)
    total(totalSumado)
}

function ocultarCarrito(e) {

    let carrito = document.getElementById("hidden")

    let ofertas = document.getElementById("ofertas")

    let ofertasTitle = document.getElementById("ofertas__title")

    let inputSearch = document.getElementById("search")

    carrito.classList.toggle("hidden")

    ofertas.classList.toggle("hidden")

    ofertasTitle.classList.toggle("hidden")

    inputSearch.classList.toggle("hidden")

    if (e.target.innerText == "Carrito") {
        e.target.innerText = "Volver"
    } else {
        e.target.innerText = "Carrito"
    }
}

function guardarStorage(valor) {

    localStorage.setItem("carrito", JSON.stringify(valor))

}

function recuperarStorage() {

    let valorJson = localStorage.getItem("carrito")

    let carrito = JSON.parse(valorJson)

    if (!carrito) {
        carrito = []
    }

    return carrito

}

function filtrarYMostrar(e, perfumes) {

        perfumes.forEach(perfume => document.getElementById(`occ${perfume.nombre}`).classList.remove("hidden"))

        let perfumesFiltrados = perfumes.filter(perfume => !(perfume.nombre.includes(e.target.value)))
        perfumesFiltrados.forEach(perfume => document.getElementById(`occ${perfume.nombre}`).classList.add("hidden"))

}

function eliminar(e) {
    let id = e.target.id.substring(3)

    let carrito = recuperarStorage()

    let indicePerfume = carrito.findIndex(perfume => id == perfume.nombre)


    if (indicePerfume != -1) {
        carrito.splice(indicePerfume, 1)
        let tarjetaCarrito = document.getElementById("tar" + id)
        tarjetaCarrito.remove()
    }

    guardarStorage(carrito)

}

function finalizarCompra() {
    Swal.fire({
        title: 'Compra!',
        text: '¿Seguro desea realizar la compra?',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        showCancelButton: true,
        cancelButtonColor:"#ff754b",
        confirmButtonColor:"#083808"
    }).then((res) => {
        if (res.isConfirmed) {
            agregarEnCarrito([])
        localStorage.removeItem("carrito")
        localStorage.setItem("carrito", JSON.stringify([]))
        }
    })
    
}

function restarUnidad(e) {
    let id = e.target.id.substring(3)

    let carrito = recuperarStorage()
    let indicePerfume = carrito.findIndex(perfume => id == perfume.nombre)

    if (indicePerfume != -1) {
        carrito[indicePerfume].unidades--
        if (carrito[indicePerfume].unidades == -1) {
            e.target.parentElement.parentElement.remove()
            carrito.splice(indicePerfume, 1)
            guardarStorage(carrito)
        } else {
            carrito[indicePerfume].subtotal = carrito[indicePerfume].subtotal = carrito[indicePerfume].precio * carrito[indicePerfume].unidades

            e.target.nextElementSibling.innerText = carrito[indicePerfume].unidades
            e.target.parentElement.nextElementSibling.innerText = carrito[indicePerfume].subtotal
            guardarStorage(carrito)
        }

    }
    let totalSumado = calcularTotal(carrito)
    total(totalSumado)
}

function sumarUnidad(e) {
    let id = e.target.id.substring(3)
    console.dir(e.target);

    let carrito = recuperarStorage()
    let indicePerfume = carrito.findIndex(perfume => perfume.nombre == id)

    if (indicePerfume != -1) {
        carrito[indicePerfume].unidades++
        carrito[indicePerfume].subtotal = carrito[indicePerfume].subtotal = carrito[indicePerfume].precio * carrito[indicePerfume].unidades

        e.target.previousElementSibling.innerText = carrito[indicePerfume].unidades
        e.target.parentElement.nextElementSibling.innerText = carrito[indicePerfume].subtotal
        guardarStorage(carrito)
    }
    let totalSumado = calcularTotal(carrito)
    total(totalSumado)
}

function calcularTotal(carrito) {
    return carrito.reduce((acum, perfume) => acum + perfume.subtotal, 0)
}

function total(valorTotal) {
    let total = document.getElementById("valorTotal")
    total.innerText = `$${valorTotal}`
}
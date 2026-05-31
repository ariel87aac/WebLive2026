def es_primo(n):
    if n < 2:
        return False

    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True


def suma_primos(numeros):
    suma = 0

    for numero in numeros:
        if es_primo(numero):
            suma += numero

    return suma


# Ejemplo
lista = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
resultado = suma_primos(lista)

print(resultado)  # 17
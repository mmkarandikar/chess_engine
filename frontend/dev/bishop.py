import numpy as np

squares = np.linspace(0, 63, 64, dtype=int)
sevens = np.arange(0, 64, 7, dtype=int) 

target = 27
bishop = []

def bishop_moves(target):
    edge_squares = [0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 23, 24, 31, 32, 39, 40, 47, 48, 55, 56, 57, 58, 59, 60, 61, 62, 63]
    number = target
    while number > 0:
        bishop.append(number)
        if number in edge_squares:
            break
        number -= 7

    number = target
    while number > 0:
        bishop.append(number)
        if number in edge_squares:
            break
        number -= 9

    number = target
    while number < 63:
        bishop.append(number)
        if number in edge_squares:
            break
        number += 7

    number = target
    while number < 63:
        bishop.append(number)
        if number in edge_squares:
            break
        number += 9

    bishop = np.sort(list(set(bishop)))
    return bishop
print(bishop)

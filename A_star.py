import random
import heapq
import sys
import time
import threading
import webbrowser
from flask import Flask, jsonify, request, render_template
from random import shuffle

barbie = Flask(__name__)

wall = 1
free = 0
rows = 23
columns = 35

def generate_maze(num_rows=rows, num_cols=columns):
    grid = [[wall] * num_cols for _ in range(num_rows)]
 
    stack = [[1, 1]]
    grid[1][1] = free
 
    directions = [[0, 2], [2, 0], [0, -2], [-2, 0]]
 
    while stack:
        row, column = stack[-1]
        options = directions[:]
        random.shuffle(options)
        moved = False
 
        for row_delta, column_delta in options:
            neighbor_row = row + row_delta
            neighbor_col = column + column_delta
 
            in_bounds = 0 < neighbor_row < num_rows - 1 and 0 < neighbor_col < num_cols - 1
 
            if in_bounds and grid[neighbor_row][neighbor_col] == wall:
                grid[neighbor_row][neighbor_col] = free
                grid[row + row_delta // 2][column + column_delta // 2] = free
                stack.append([neighbor_row, neighbor_col])
                moved = True
                break
 
        if not moved:
            stack.pop()
 
    return grid

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def a_star_search(grid, start, end):
    num_rows = len(grid)
    num_columns = len(grid[0])

    def node(position):  
        return position[0] * num_columns + position[1]

    start_id = node(start)
    end_id = node(end)

    heap = [(heuristic(start, end), 0, start)]
    visited = set()
    best_cost = {start_id: 0}
    came_from = {}

    while heap:
        total, cost_now, current_position = heapq.heappop(heap)
        current_id = node(current_position)

        if current_id in visited:
            continue

        if current_id == end_id:
            path = []
            back = current_id
            while back in came_from:
                row = back // num_columns
                column = back % num_columns
                path.append([row, column])
                back = came_from[back]
            path.append([start[0], start[1]])
            path.reverse()
            return path

        visited.add(current_id)

        for row_change, column_change in [[0, 1], [1, 0], [0, -1], [-1, 0]]:
            neighbor_row = current_position[0] + row_change
            neighbor_column = current_position[1] + column_change

            if not (0 <= neighbor_row < num_rows and 0 <= neighbor_column < num_columns):
                continue
            if grid[neighbor_row][neighbor_column] == wall: 
                continue

            neighbor_position = [neighbor_row, neighbor_column]
            neighbor_id = node(neighbor_position)

            if neighbor_id in visited:
                continue

            neighbor_cost = best_cost[current_id] + 1

            if neighbor_cost < best_cost.get(neighbor_id, float('inf')):
                came_from[neighbor_id] = current_id
                best_cost[neighbor_id] = neighbor_cost
                neighbor_total = neighbor_cost + heuristic(neighbor_position, end)
                heapq.heappush(heap, (neighbor_total, neighbor_cost, neighbor_position))

    return []

@barbie.route('/')
def index():
    import sys
    version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    return render_template('index.html', python_version=version)

@barbie.route('/api/maze')
def api_maze():
    grid = generate_maze(rows, columns)
    grid[1][1] = 2 
    grid[rows-2][columns-2] = 3   
    return jsonify({'grid': grid, 'rows': rows, 'cols': columns})

@barbie.route('/api/solve', methods=['POST'])
def api_solve():
    data = request.get_json()
    grid = data['grid']
    start = [1, 1]
    end = [rows - 2, columns - 2]

    clean = [[0 if c in (0,2,3) else 1 for c in row] for row in grid]

    path = a_star_search(clean, start, end)
    return jsonify({'found': bool(path), 'path': path, 'path_len': len(path)})

if __name__ == "__main__":
    def open_browser():
        time.sleep(1.2)
        webbrowser.open('http://localhost:5000')

    threading.Thread(target=open_browser, daemon=True).start()
    barbie.run(debug=False, port=5000)

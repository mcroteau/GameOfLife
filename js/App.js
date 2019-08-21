	var App = (function(){

		var BOARD_HEIGHT = 320,
			BOARD_WIDTH = 480,
			CELL_SIZE = 8;

		var $board = $('#board'),
			$generations = $('#generations'),
			$cellsAlive = $('#cells-alive'),
			$start = $('#start'),
			$stop = $('#stop'),
			$step = $('#step'),
			$clear = $('#clear'), 
			$random = $('#random');
			
		var	CELL_TEMPLATE = $('#cell_template').text();
		
		var ALIVE_CLASS = 'alive';
	
		var number_elements_height = BOARD_HEIGHT/CELL_SIZE;
		var number_elements_width = BOARD_WIDTH/CELL_SIZE;
	
		var x_coord = y_coord = 0;
	
		var timer = null;
	
		var cells = {};
		var nextGeneration = {};
	
		var generations = 0;
		var cellsAlive = 0;
	
		var stable = true;
		var stableCount = 0;
		
		
		function initialize(){
			initializeBoard();
			setupClickEvents();
		}
		
		function initializeBoard(){
			styleBoard();
			generateCells();
		}
	
		function styleBoard(){
			$board.css({
				height : BOARD_HEIGHT + "px",
				width : BOARD_WIDTH + "px"
			});
		}
	
		function generateCells(){
			for(var x = 0; x < number_elements_width; x++){
				x_coord = x * CELL_SIZE;
			
				for( var y = 0; y < number_elements_height; y++){
				
					y_coord = y * CELL_SIZE;
					var cell_height = cell_width = (CELL_SIZE -1);
			
					var coordinates = x_coord + "_" + y_coord;
					var cellHtml = getCellHtml(x_coord, y_coord, cell_height, cell_width, coordinates);
					
					$board.append(cellHtml);
				
					var $element = $('#' + coordinates);
					cells[coordinates] = {
						x : x_coord,
						y : y_coord,
						alive : false,
						element : $element
					}
				}
			}
		}
		
		function getCellHtml(x_coord, y_coord, cell_height, cell_width, coordinates){
			return Mustache.to_html(CELL_TEMPLATE, {
				x_coord : x_coord,
				y_coord : y_coord,
				cell_height : cell_height,
				cell_width : cell_width,
				coordinates : coordinates
			});
		}

		function setupClickEvents(){
			$start.click(start);
			$stop.click(stop);
			$step.click(step);
			$clear.click(clear);
			$random.click(generateRandom);
			$('.cell').click(toggleAlive);
		}
	
		function start(){
			$start.hide();
			$stop.show();
			if(!timer){
				timer = setInterval(checkLife, 0)
			}
		}
	
		function stop(){
			$stop.hide();
			$start.show();
			if (timer) {
				clearInterval(timer);
			    timer = null;
			}
		}
	
		function step(){
			checkLife();
		}
	
		function clear(){
			for(var coords in cells){
				if(cells[coords].alive){
					cells[coords].alive = false;
					cells[coords].element.removeClass(ALIVE_CLASS);
				}
			}
			generations = 0;
			$generations.html(generations);
			cellsAlive = 0;
			$cellsAlive.html(cellsAlive);
		}
	
		function checkLife(){
			for(var coords in cells){
				var cell = cells[coords]
				var aliveNeighbors = getAliveNeighbors(cell)
			
				nextGeneration[coords] = {alive : false};
			
				//Any live cell with fewer than two live neighbours dies, as if caused by under-population.
				if(cell.alive && aliveNeighbors < 2){
					nextGeneration[coords].alive = false;
				}
			
				//Any live cell with two or three live neighbours lives on to the next generation.
				if(cell.alive && (aliveNeighbors == 2 || aliveNeighbors == 3)){
					nextGeneration[coords].alive = true;
				}
			
				//Any live cell with more than three live neighbours dies, as if by overcrowding.
				if(cell.alive && aliveNeighbors > 3){
					nextGeneration[coords].alive = false;
				}
			
				//Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
				if(!cell.alive && aliveNeighbors == 3){
					nextGeneration[coords].alive = true;
				}
							   
			}
			drawNextGeneration()		
		}
	
		function drawNextGeneration(){
			cellsAlive = 0;
			stable = true;
			for(var coords in nextGeneration){
				var alive = nextGeneration[coords].alive
				var previous = cells[coords].alive;
				
				if(alive){
					cellsAlive++;
					cells[coords].alive = true;
					cells[coords].element.addClass(ALIVE_CLASS);
				}else{
					cells[coords].alive = false;
					cells[coords].element.removeClass(ALIVE_CLASS);
				}
				
				if(alive != previous){
					stable = false;
				}
			}
			checkStable();
			updateStats();
		}
		
		function checkStable(){
			if(stable){
				stableCount++;
			}else{
				stableCount = 0;
			}
			
			if(stableCount == 2){
				stop();
			}
		}
	
		function updateStats(){
			generations++;
			$generations.html(generations);
			updateCellsAliveStat();
		}
	
		function updateCellsAliveStat(){
			$cellsAlive.html(cellsAlive);
		}
	
		function generateRandom(){
			cellsAlive = 0;
			for(var coords in cells){
				var alive = [true, false][Math.round(Math.random())]
				var num = Math.floor((Math.random() * 10) + 1)
			
				if(alive && (num % 3 == 0)){
					cellsAlive++;
					cells[coords].alive = true;
					cells[coords].element.addClass(ALIVE_CLASS);
				}else{
					cells[coords].alive = false;
					cells[coords].element.removeClass(ALIVE_CLASS);
				}
			}
			updateCellsAliveStat();
			$random.removeClass("control-random").addClass("control-default");
		}
	
		function getAliveNeighbors(cell){
			var count = 0;
			
			//top, left
			if(cell.y != 0 && cell.x != 0){
				var top = cell.y - CELL_SIZE;
				var left = cell.x - CELL_SIZE;
				if(cells[left + "_" + top].alive){
					count++;
					//console.info('top left match', cell.element, cells[left + "_" + top].element);
				}
			}
		
			//top, middle
			if(cell.y != 0){
				var top = cell.y - CELL_SIZE;
				if(cells[cell.x + "_" + top].alive){
					count++;
					//console.info('top match', cell.element, cells[cell.x + "_" + top].element);
				}
			}
		
			//top, right
			if(cell.y != 0 && cell.x != (BOARD_WIDTH - CELL_SIZE)){
				var right = cell.x + CELL_SIZE;
				var top = cell.y - CELL_SIZE;
				if(cells[right + "_" + top].alive){
					count++;
					//console.info('top right match', cell.element, cells[right + "_" + top].element)
				}
			}
		
			//middle, right
			if(cell.x != BOARD_WIDTH - CELL_SIZE){
				var right = cell.x + CELL_SIZE;
				if(cells[right + "_" + cell.y].alive){
					count++;
					//console.info('right match', cell.element, cells[right + "_" + cell.y].element);
				}
			}
			
			//bottom, right
			if(cell.y != (BOARD_HEIGHT - CELL_SIZE) && cell.x != BOARD_WIDTH - CELL_SIZE){
				var right = cell.x + CELL_SIZE
				var bottom = cell.y + CELL_SIZE;
				if(cells[right + "_" + bottom].alive){
					count++;
					//console.info('bottom right match', cell.element, cells[right + "_" + bottom].element)
				}
			}
		
			//bottom, middle
			if(cell.y != (BOARD_HEIGHT - CELL_SIZE)){
				var bottom = cell.y + CELL_SIZE;
				if(cells[cell.x + "_" + bottom].alive){
					count++;
					//console.info('bottom match', cell.element, cells[cell.y + "_" + bottom].element)
				}
			}
		
			//bottom, left
			if(cell.y != (BOARD_HEIGHT - CELL_SIZE) && cell.x != 0){
				var left = cell.x - CELL_SIZE;
				var bottom = cell.y + CELL_SIZE;
				if(cells[left + "_" + bottom].alive){
					count++;
					//console.info('bottom, left match', cell.element, cells[left + "_" + bottom].element)	
				}
			}
		
			//middle, left
			if(cell.x != 0){
				var left = cell.x - CELL_SIZE
				if(cells[left + "_" + cell.y].alive){
					count++;
					//console.info('left match', cell.element);
				}
			}
		
			return count;
		}
	
		function toggleAlive(event){
		
			$target = $(event.target);
			var id = $target.attr('id');
		
			var alive = cells[id].alive;
			if(alive){
				cells[id].alive = false;
			}else{
				cells[id].alive = true;
			}
		
			$target.toggleClass(ALIVE_CLASS);
		
		}
	
		return {
			initialize : initialize
		}

	})();
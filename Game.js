"use strict";
var CellStatus = Object.freeze({ "Unknown": 1, "NoMine": 2, "Mine": 3, "Invalid": 4 });
var Game = /** @class */ (function () {
    function Game(width, height, mineCount) {
        this.width = width;
        this.height = height;
        this.mineCount = mineCount;
    }
    Game.prototype.Start = function (contentElement) {
        this.cellStatuses = [];
        this.gameIsOver = false;
        this.contentElement = contentElement;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.SetCellStatus(x, y, CellStatus.Unknown);
            }
        }
        for (var i = 0; i < this.mineCount; i++) {
            var x = Math.floor(Math.random() * this.width);
            var y = Math.floor(Math.random() * this.height);
            // Let's make sure that this position isn't already in the mine list.
            // If it is, then we'll push the position forward by 1 until we find
            // a position at which there is no mine.
            while (this.GetCellStatus(x, y) == CellStatus.Mine) {
                x++;
                if (x >= this.width) {
                    x = 0;
                    y++;
                    if (y >= this.height) {
                        y = 0;
                    }
                }
            }
            this.SetCellStatus(x, y, CellStatus.Mine);
        }
        var gridHtml = "<table>";
        for (var y = 0; y < this.height; y++) {
            gridHtml += "<tr>";
            for (var x = 0; x < this.width; x++) {
                gridHtml += "<td class=\"Cell Unknown\" data-x=\"" + x + "\" data-y=\"" + y + "\">";
                if (this.IsMineAt(x, y)) {
                    gridHtml += "<span class=\"MineCell\">\uD83D\uDCA3</span>";
                }
                gridHtml += "</td>";
            }
            gridHtml += "</tr>";
        }
        gridHtml += "</table>";
        this.contentElement.html(gridHtml);
        this.contentElement.addClass("GameInProgress");
        $(".Cell").on("click", { game: this }, function (event) {
            event.data.game.OnCellClicked($(this));
        });
    };
    Game.prototype.OnCellClicked = function (cellElement) {
        if (this.gameIsOver) {
            return;
        }
        var x = cellElement.data("x");
        var y = cellElement.data("y");
        // If the player clicked on a mine cell, then the player has lost.
        if (this.IsMineAt(x, y)) {
            cellElement.removeClass("Unknown");
            cellElement.addClass("TriggeredMine");
            this.contentElement.removeClass("GameInProgress");
            this.gameIsOver = true;
        }
        else {
            this.UpdateCell(cellElement.data("x"), cellElement.data("y"));
        }
    };
    Game.prototype.UpdateCell = function (x, y) {
        var _this = this;
        // We'll only do anything to update a cell if it's a valid cell
        // whose status is unknown.  Otherwise, there's nothing for us to update.
        if (this.GetCellStatus(x, y) != CellStatus.Unknown ||
            x < 0 || x >= this.width ||
            y < 0 || y >= this.height) {
            return;
        }
        var cellElement = $(".Cell[data-x=\"" + x + "\"][data-y=\"" + y + "\"]");
        var mineCount = 0;
        this.InvokeOnSurroundingCells(x, y, function (adjacentX, adjacentY) {
            if (_this.IsMineAt(adjacentX, adjacentY)) {
                mineCount++;
            }
        });
        cellElement.removeClass("Unknown");
        cellElement.addClass("Filled");
        if (mineCount > 0) {
            cellElement.html("<span class=\"MineCountCell Mine" + mineCount + "\">" + mineCount + "</span>");
        }
        else {
            this.SetCellStatus(x, y, CellStatus.NoMine);
            this.InvokeOnSurroundingCells(x, y, function (adjacentX, adjacentY) {
                _this.UpdateCell(adjacentX, adjacentY);
            });
        }
    };
    Game.prototype.IsValidCell = function (x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    };
    Game.prototype.GetCellStatus = function (x, y) {
        if (!this.IsValidCell(x, y)) {
            return CellStatus.Invalid;
        }
        else {
            return this.cellStatuses[x + y * this.width];
        }
    };
    Game.prototype.SetCellStatus = function (x, y, cellStatus) {
        if (this.IsValidCell(x, y)) {
            this.cellStatuses[x + y * this.width] = cellStatus;
        }
    };
    Game.prototype.IsMineAt = function (x, y) {
        return this.GetCellStatus(x, y) == CellStatus.Mine;
    };
    Game.prototype.InvokeOnSurroundingCells = function (x, y, func) {
        func(x - 1, y - 1);
        func(x, y - 1);
        func(x + 1, y - 1);
        func(x - 1, y);
        func(x + 1, y);
        func(x - 1, y + 1);
        func(x, y + 1);
        func(x + 1, y + 1);
    };
    return Game;
}());
//# sourceMappingURL=Game.js.map
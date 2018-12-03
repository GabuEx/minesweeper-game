"use strict";

var CellStatus = Object.freeze({"Unknown":1, "NoBomb":2, "Bomb":3, "Invalid":4});

class Game
{
    constructor(width, height, mineCount)
    {
        this.width = width;
        this.height = height;
        this.mineCount = mineCount;
    }

    Start(contentElement)
    {
        this.cellStatuses = [];
        this.gameIsOver = false;

        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                this.SetCellStatus(x, y, CellStatus.Unknown);
            }
        }

        for (let i = 0; i < this.mineCount; i++)
        {
            let x = Math.floor(Math.random() * this.width);
            let y = Math.floor(Math.random() * this.height);

            // Let's make sure that this position isn't already in the mine list.
            // If it is, then we'll push the position forward by 1 until we find
            // a position at which there is no mine.
            while (this.GetCellStatus(x, y) == CellStatus.Bomb)
            {
                x++;

                if (x >= this.width)
                {
                    x = 0;
                    y++;

                    if (y >= this.height)
                    {
                        y = 0;
                    }
                }
            }

            this.SetCellStatus(x, y, CellStatus.Bomb);
        }

        let gridHtml = "";

        for (let y = 0; y < this.height; y++)
        {
            gridHtml += "<tr>";

            for (let x = 0; x < this.width; x++)
            {
                gridHtml += `<td class="Cell" data-x="${x}" data-y="${y}">`;

                if (this.IsMineAt(x, y))
                {
                    gridHtml += "💣";
                }

                gridHtml += "</td>";
            }

            gridHtml += "</tr>";
        }

        gridHtml += "</table>";

        contentElement.html(gridHtml);

        $(".Cell").on("click", { game: this }, function(event) {
            event.data.game.OnCellClicked($(this))
        });
    }

    OnCellClicked(cellElement)
    {
        if (this.gameIsOver)
        {
            return;
        }

        let x = $(cellElement).data("x")
        let y = $(cellElement).data("y")

        // If the player clicked on a mine cell, then the player has lost.
        if (this.IsMineAt(x, y))
        {
            cellElement.css('background-color', 'red');
            this.gameIsOver = true;
        }
        else
        {
            this.UpdateCell($(cellElement).data("x"),  $(cellElement).data("y"));
        }
    }

    UpdateCell(x, y)
    {
        // We'll only do anything to update a cell if it's a valid cell
        // whose status is unknown.  Otherwise, there's nothing for us to update.
        if (this.GetCellStatus(x, y) != CellStatus.Unknown ||
            x < 0 || x >= this.width ||
            y < 0 || y >= this.height)
        {
            return;
        }

        let cellElement = $(`.Cell[data-x="${x}"][data-y="${y}"]`)
        let mineCount = 0;

        this.InvokeOnSurroundingCells(x, y, (adjacentX, adjacentY) =>
        {
            if (this.IsMineAt(adjacentX, adjacentY))
            {
                mineCount++;
            }
        });

        if (mineCount > 0)
        {
            cellElement.html(mineCount);
        }
        else
        {
            this.SetCellStatus(x, y, CellStatus.NoBomb);

            this.InvokeOnSurroundingCells(x, y, (adjacentX, adjacentY) =>
            {
                this.UpdateCell(adjacentX, adjacentY);
            });
        }
    }

    IsValidCell(x, y)
    {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    GetCellStatus(x, y)
    {
        if (!this.IsValidCell(x, y))
        {
            return CellStatus.Invalid;
        }
        else
        {
            return this.cellStatuses[x + y * this.width];
        }
    }

    SetCellStatus(x, y, cellStatus)
    {
        if (this.IsValidCell(x, y))
        {
            this.cellStatuses[x + y * this.width] = cellStatus;
        }
    }

    IsMineAt(x, y)
    {
        return this.GetCellStatus(x, y) == CellStatus.Bomb;
    }

    InvokeOnSurroundingCells(x, y, func)
    {
        func(x - 1, y - 1);
        func(x, y - 1);
        func(x + 1, y - 1);
        func(x - 1, y);
        func(x + 1, y);
        func(x - 1, y + 1);
        func(x, y + 1);
        func(x + 1, y + 1);
    }
}

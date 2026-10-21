import { CARDS } from "./content/catalog"
import { preview } from "./view/sprites"

const root = document.getElementById("root")!
const order: Array<"unit" | "vehicle" | "gear"> = ["unit", "vehicle", "gear"]

for (const kind of order) {
  const rows = CARDS.filter((c) => c.kind === kind && c.deck !== false)
  const h = document.createElement("h2")
  h.textContent = `${kind.toUpperCase()} (${rows.length})`
  root.append(h)
  const grid = document.createElement("div")
  grid.className = "grid"
  for (const row of rows) {
    const cell = document.createElement("div")
    cell.className = row.id === "k9" ? "cell hot" : "cell"
    const spr = preview(row.id, 64)
    const name = document.createElement("div")
    name.className = "name"
    name.textContent = row.name
    const id = document.createElement("div")
    id.className = "id"
    id.textContent = row.id
    cell.append(spr, name, id)
    grid.append(cell)
  }
  root.append(grid)
}

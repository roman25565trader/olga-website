/** Ячейка списка для галочек: «✅ Да» / «Нет» вместо «правда / ложь» */
export function BoolCell({ cellData }: { cellData?: unknown }) {
  return cellData ? <span className="oc-bool">✅ Да</span> : <span className="oc-bool oc-bool--no">— Нет</span>
}

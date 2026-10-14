import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap sec sec-b">
      <div className="ok">
        <h1 className="h2">
          Такой страницы <em>нет</em>
        </h1>
        <p>Возможно, букет уже раскупили. Посмотрите другие — или напишите флористу.</p>
        <p style={{ marginTop: 28 }}>
          <Link href="/" className="btn btn--primary">
            На главную
          </Link>
        </p>
      </div>
    </div>
  )
}

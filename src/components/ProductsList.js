import { Provider, useAppBridge } from '@shopify/app-bridge-react'
import { Card, DataTable, Link } from '@shopify/polaris'
import { Redirect } from '@shopify/app-bridge/actions'

const ProductsList = ({ rows }) => {
  const app = useAppBridge()
  const redirect = Redirect.create(app)

  const openProductReport = (id) => {
    redirect.dispatch(Redirect.Action.APP, `/product/${id}`)
  }

  const mapProductRows = (rows) => {
    const mappedRows = []
    rows.forEach((row) => {
      mappedRows.push([
        row.id,
        row.vendor,
        <Link
          removeUnderline
          onClick={() => openProductReport(row.id)}
          key="emerald-silk-gown"
        >
          {row.title}
        </Link>
      ])
    })

    return mappedRows
  }

  return (
    <Card>
      <DataTable
        columnContentTypes={['numeric', 'text', 'text']}
        headings={['ID', 'Vendor', 'Product']}
        rows={mapProductRows(rows)}
      />
    </Card>
  )
}

export default ProductsList

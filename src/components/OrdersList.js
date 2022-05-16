import { Card, DataTable, Link, TextStyle } from '@shopify/polaris'
import { useAppBridge } from '@shopify/app-bridge-react'
import { Redirect } from '@shopify/app-bridge/actions'

import * as dayjs from 'dayjs'
dayjs().format()

const OrdersList = ({ rows }) => {
  const app = useAppBridge()
  const redirect = Redirect.create(app)

  const openOrder = (id) => {
    redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
      newContext: true,
      section: {
        name: Redirect.ResourceType.Order,
        resource: {
          id
        }
      }
    })
  }

  const mapOrderRows = (rows) => {
    const mappedRows = []
    rows.forEach((row) => {
      mappedRows.push([
        <div style={{ fontSize: '1.4rem', maxWidth: '22rem' }}>
          <TextStyle variation="subdued">{row.destination}</TextStyle>
        </div>,
        row.orderId,
        row.customerName,
        row.name,
        row.financialStatus,
        dayjs(row.date).format('MM/DD/YYYY h:mm:ss A'),
        row.price
      ])
    })

    return mappedRows
  }

  return (
    <Card>
      <DataTable
        columnContentTypes={[
          'text',
          'numeric',
          'text',
          'text',
          'text',
          'text',
          'numeric'
        ]}
        headings={[
          'Shipping Address',
          'Order Id',
          'Name',
          'Product',
          'Status',
          'Date',
          'Price'
        ]}
        rows={mapOrderRows(rows)}
      />
    </Card>
  )
}

export default OrdersList

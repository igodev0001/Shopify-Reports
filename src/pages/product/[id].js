import { useRouter } from 'next/router'
import {
  Badge,
  Button,
  Card,
  DatePicker,
  DisplayText,
  Frame,
  Loading,
  Page,
  Spinner,
  Subheading,
  Tag
} from '@shopify/polaris'
import { useCallback, useEffect, useState } from 'react'
import { Provider, useAppBridge } from '@shopify/app-bridge-react'
import { Redirect } from '@shopify/app-bridge/actions'
import axios from 'axios'
import styles from '../index.module.css'
import OrdersList from '../../components/OrdersList'
import * as dayjs from 'dayjs'
import { exportToCsv } from '../../utils/client'
import { CSVDownload, CSVLink } from 'react-csv'
dayjs().format()

const currentMonth = dayjs().format('M') - 1
const currentYear = dayjs().format('YYYY')

const Product = () => {
  const app = useAppBridge()
  const redirect = Redirect.create(app)
  const router = useRouter()

  const { id } = router.query
  const [data, setData] = useState({ product: null, customers: [] })
  const [product, setProduct] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [exportData, setExportData] = useState([])
  const [{ month, year }, setDate] = useState({
    month: currentMonth,
    year: currentYear
  })
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(),
    end: new Date()
  })

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  )

  const openHome = () => {
    redirect.dispatch(Redirect.Action.APP, '/')
  }

  useEffect(() => {
    getProduct()
  }, [])

  const getProduct = async () => {
    setIsLoading(true)
    const response = await axios.get(`/products/${id}`)
    setProduct(response.data)
    setIsLoading(false)
  }

  const getData = async () => {
    setData({ product: null, customers: [] })
    setIsFetching(true)
    const startDate = dayjs(selectedDates.start).toISOString()
    const endDate = dayjs(selectedDates.end).toISOString()
    const response = await axios.get(
      `/reports/products/${id}/orders?created_at_min=${startDate}&created_at_max=${endDate}`
    )
    setData(response.data)
    handleExportData(response.data.customers)
    setIsFetching(false)
  }

  const handleExportData = (data) => {
    const exported = []
    data.forEach((item) => {
      item.orders.forEach((order) => {
        exported.push([
          order.destination,
          order.customerName,
          item.email,
          order.date,
          order.price,
          order.orderId
        ])
      })
    })

    setExportData(exported)
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Frame>
          <Loading />
          <Spinner accessibilityLabel="Loading..." size="large" />
        </Frame>
      </div>
    )
  }

  return (
    <Page
      breadcrumbs={[
        {
          content: 'Duplicate',
          accessibilityLabel: 'Secondary action label',
          onAction: () => openHome()
        }
      ]}
    >
      <div className={styles.productWrapper}>
        <div className={styles.titleWrapper}>
          <DisplayText size="medium">{product.title}</DisplayText>
        </div>

        <div className={styles.datePicker}>
          <Card title="Filter orders by date" sectioned>
            <DatePicker
              month={month}
              year={year}
              onChange={setSelectedDates}
              onMonthChange={handleMonthChange}
              selected={selectedDates}
              allowRange
            />
            <div className={styles.actionButton}>
              <div>&nbsp;</div>
              <div>
                <Button
                  loading={isFetching}
                  primary
                  onClick={() => getData(data.customers)}
                >
                  Search
                </Button>
              </div>
            </div>
          </Card>
        </div>
        <div className={styles.resultsWrapper}>
          <Card sectioned>
            {data.customers.length > 0 && (
              <div className={styles.exportButton}>
                <CSVLink
                  filename={`exported-orders-${data.product.id}.csv`}
                  data={exportData}
                >
                  <Button outline>Export Results</Button>
                </CSVLink>
              </div>
            )}
            <div>
              {isFetching && (
                <div className={styles.innerLoading}>
                  <Spinner accessibilityLabel="Loading..." size="medium" />
                </div>
              )}
            </div>
            <div>
              {data.customers.length > 0 &&
                data.customers.map((customer) => (
                  <div className={styles.customerWrapper} key={customer.id}>
                    <Subheading>
                      <div className={styles.customerTitleWrapper}>
                        <div>{customer.name} </div>
                        <div>
                          <Badge status="success">{customer.email}</Badge>
                        </div>
                      </div>
                    </Subheading>
                    <OrdersList rows={customer.orders} />
                  </div>
                ))}
              {data.product && data.customers.length === 0 && (
                <div>No orders were found.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  )
}

export default Product

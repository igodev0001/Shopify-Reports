import {
  Badge,
  Card,
  DisplayText,
  Frame,
  Heading,
  Loading,
  Page,
  Spinner,
  Subheading,
  Tag
} from '@shopify/polaris'
import { useEffect, useState } from 'react'
import axios from 'axios'
import styles from './index.module.css'
import ProductsList from '../components/ProductsList'

const Index = () => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setIsLoading(true)
    const response = await axios.get('/products')
    setProducts(response.data)
    setIsLoading(false)
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
    <Page>
      <div className={styles.productWrapper}>
        <div className={styles.titleWrapper}>
          <DisplayText size="medium">Products</DisplayText>
        </div>
        <ProductsList rows={products} />
      </div>
    </Page>
  )
}

export default Index

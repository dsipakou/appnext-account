import React from 'react'
import Router from 'next/router'
import { useAuth } from '@/context/auth'

const withAuth = <T,>(WrappedComponent: React.ComponentType<T>) => {
  const { isAuthenticated } = useAuth()
  return class extends React.Component {
    static async getInitialProps(ctx) {
      let wrappedComponentProps = {}
      if (WrappedComponent.getInitialProps) {
        wrappedComponentProps = await WrappedComponent.getInitialProps(ctx)
      }
      return { ...wrappedComponentProps }
    }

    componentDidMount() {
      if (!isAuthenticated) {
        Router.push('/login')
      }
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}

export default withAuth

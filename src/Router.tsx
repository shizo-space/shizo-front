import React from 'react'
import { BrowserRouter as ReactRouter, Switch, Route, Redirect } from 'react-router-dom'
import { Map } from './components/Map'
import Properties from './components/Properties'


const Router = () => {
  return (
    <ReactRouter>
      <Switch>
        <Route path="/my-properties" exact>
          <Properties />
        </Route>
        <Route path={['/map/:mergeId', '/map']}>
          <Map />
        </Route>
        <Route path="/" exact>
          <Redirect to="/map" />
        </Route>
      </Switch>
    </ReactRouter>
  )
}

export default Router

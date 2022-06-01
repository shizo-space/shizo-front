class NodeWorker {
	isErrorNeedAnotherAttempt(error: any) {
		//node running with state pruning
		if(error.code === -32000 && typeof error.message === 'string' && error.message.indexOf('pruning') > 0) {
			return true
		}
		return false
	}

	sync<T extends any>(service: Function, attemptNumber = 5) : T {
		if (typeof service !== 'function') {
			throw new Error('Service should be a function')
		}
		try {
			return service()
		} catch (error) {
			if(this.isErrorNeedAnotherAttempt(error) && attemptNumber > 0) {
				return this.sync(service, attemptNumber - 1)
			}
			throw error
		}
	}

	async async<T extends any>(service: Function, attemptNumber = 5) : Promise<T> {
		if (typeof service !== 'function') {
			throw new Error('Service should be a function')
		}
		try {
			return (await service())
		} catch (error) {
			if(this.isErrorNeedAnotherAttempt(error) && attemptNumber > 0) {
				return (await this.sync(service, attemptNumber - 1))
			}
			throw error
		}
	}
}

export default new NodeWorker()

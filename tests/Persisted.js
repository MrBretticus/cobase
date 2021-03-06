const { Persisted, Cached } = require('..')
const { Test, TestCached } = require('./model/TestCached')
suite('Persisted', function() {
	this.timeout(1000000)
	suiteSetup(() => {
	})

	test('standalone table', () => {
		Test.for(10).put({ name: 'ten' })
		return Test.for(10).then(value => {
			assert.equal(value.name, 'ten')
			return Test.instanceIds.then(ids => {
				assert.deepEqual(ids, [10])
			})
		})
	})
	test('cached transform', () => {
		return TestCached.for(10).then(value => {
			assert.equal(value.upperName, 'TEN')
		})
	})

	/*
	suiteTeardown(() => {
		console.log('teardown persisted')
		return Promise.all([
			Test.db.close(),
			TestCached.db.close()
		])
	})*/
})

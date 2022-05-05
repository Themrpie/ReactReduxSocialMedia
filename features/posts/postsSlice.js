import {createSlice} from '@reduxjs/toolkit'

const initialState = [
{
	id: '1', title: 'Primer post', content: 'Hola como va'
},
{
	id: '2', title: 'Segundo post', content: 'Comentando ando'
}]

const postsSlice = createSlice({
	name : 'posts',
	initialState,
	reducers: {}
})

export default postsSlice.reducer
import { createSlice, nanoid, createAsyncThunk, createSelector, createEntityAdapter } from '@reduxjs/toolkit'
import {sub} from 'date-fns'
import { client } from '../../api/client'

const postsAdapter = createEntityAdapter({
	sortComparer: (a,b) => b.date.localCompare(a.date)
})

const initialState = {
  status: 'idle',
  error: null
}

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
	const response = await client.get('/fakeApi/posts')
	return response.data
})

export const addNewPost = createAsyncThunk('posts/addNewPost', async initialPost => {
	//Send initial data to API server
	const response = await client.post('fakeApi/posts', initialPost)
	return response.data
})

const postsSlice = createSlice({
	name : 'posts',
	initialState,

	reducers: {

		reactionAdded(state, action) {
			const { postId, reaction } = action.payload
			const existingPost = state.entities[postId]
			if (existingPost) {
				existingPost.reactions[reaction]++
				}
			
		}
		,

		postAdded(state, action){
			state.posts.push(action.payload)
		},

		prepare(title, content, userId) {
			return {
				payload: {
					id: nanoid(),
					date: new Date().toISOString(),
					title,
					content,
					user: userId,
					reactions: {
		              thumbsUp: 0,
		              thumbsDown: 0,
		              heart: 0,
		              rocket: 0,
		              eyes: 0,
		            },
				}
		}

		},

		postUpdated(state, action) {
			const {id, title, content} = action.payload
			const existingPost = state.entities[id]
			if (existingPost){
				existingPost.title = title
				existingPost.content = content
			}
		}
	},

	extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add any fetched posts to the array
        //state.posts = state.posts.concat(action.payload)
        postsAdapter.upsertMany(state, action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addNewPost.fulfilled, postsAdapter.addOne)
  }
})
export const {postAdded, postUpdated, reactionAdded} = postsSlice.actions
export default postsSlice.reducer
//export const selectPostById = (state, postId) => state.posts.posts.find(post => post.id === postId)
// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors((state) => state.posts)

export const selectPostsByUser = createSelector(
	[selectAllPosts, (state, userId) => userId],
	(posts, userId) => posts.filter((post) => post.user === userId)
	)


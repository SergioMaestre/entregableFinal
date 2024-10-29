require('../models')
const request = require('supertest')
const app = require('../app')

let user
let TOKEN
let hotel
let hotelId
let booking
let bookingId

const BASE_URL = "/api/v1/bookings"

beforeAll(async () => {
  user = await request(app)
    .post('/api/v1/users')
    .send({
      firstName: "Sergio",
      lastName: "Maestre",
      email: "Sergio@gmail.com",
      password: "sergio1234",
      gender: "male"
    })

  const credentials = {
    email: "Sergio@gmail.com",
    password: "sergio1234"
  }

  const resToken = await request(app)
    .post('/api/v1/users/login')
    .send(credentials)

  TOKEN = resToken.body.token


  hotel = await request(app)
    .post('/api/v1/hotels')
    .send({
      name: "JW Marriott Hotel",
      description: "El JW Marriott Bogotá ofrece lujo moderno en el corazón de la ciudad, con habitaciones elegantes, spa, gastronomía refinada y fácil acceso a zonas exclusivas.",
      price: "596",
      address: "El JW Marriott Bogotá se encuentra en la Calle 73 #8-60, en la zona financiera de Bogotá, cerca de la Zona G, famosa por su gastronomía.",
      lat: "4.6588",
      lon: "-74.057",
      raiting: "5.0",
  })
    .set('Authorization', `Bearer ${TOKEN}`)

  hotelId = hotel.body.id

  booking = {
    hotelId: hotel.body.id,
    url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/598431866.jpg?k=30a941272eed82b4f5ad15e2e01d7d2978c8c7f50fc0d5b8a687a0197c552812&o=&hp=1",
    checkIn: "2024-10-02",
    checkOut: "2024-10-25"
  }

})

afterAll(async () => {
  await request(app)
    .delete(`/api/v1/users/${user.body.id}`)
    .set('Authorization', `Bearer ${TOKEN}`)

  await request(app)
    .delete(`/api/v1/hotels/${hotelId}`)
    .set('Authorization', `Bearer ${TOKEN}`)
})

test("POST -> 'BASE_URL', should return status code 201, and res.body.name === city.name", async () => {

  const res = await request(app)
    .post(BASE_URL)
    .send(booking)
    .set('Authorization', `Bearer ${TOKEN}`)

  bookingId = res.body.id

  expect(res.status).toBe(201)
  expect(res.body).toBeDefined()
  expect(res.body.checkIn).toBe(booking.checkIn)
})


test("GET -> 'BASE_URL', should return status code 200, and res.body.length === 1", async () => {

  const res = await request(app)
    .get(BASE_URL)
    .set('Authorization', `Bearer ${TOKEN}`)

  expect(res.status).toBe(200)
  expect(res.body).toBeDefined()
  expect(res.body).toHaveLength(1)
  expect(res.body[0].checkIn).toBe(booking.checkIn)
})

test("GET -> 'BASE_URL/:id', should return status code 200, and res.body.name === city.name", async () => {

  const res = await request(app)
    .get(`${BASE_URL}/${bookingId}`)
    .set('Authorization', `Bearer ${TOKEN}`)

  expect(res.status).toBe(200)
  expect(res.body).toBeDefined()
  expect(res.body.checkIn).toBe(booking.checkIn)
})

test("PUT -> 'BASE_URL/:id', should return status code 200, and res.body.name === cityUpdate.name", async () => {

  const bookingUpdate = {
    checkIn: "2024-10-26"
  }

  const res = await request(app)
    .put(`${BASE_URL}/${bookingId}`)
    .send(bookingUpdate)
    .set('Authorization', `Bearer ${TOKEN}`)

  expect(res.status).toBe(200)
  expect(res.body).toBeDefined()
  expect(res.body.checkIn).toBe(bookingUpdate.checkIn)
})


test("REMOVE -> 'BASE_URL/:id', should return status code 204", async () => {
  const res = await request(app)
    .delete(`${BASE_URL}/${bookingId}`)
    .set('Authorization', `Bearer ${TOKEN}`)

  expect(res.status).toBe(204)
})
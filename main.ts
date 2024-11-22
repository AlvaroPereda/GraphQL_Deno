import { MongoClient, ObjectId } from 'mongodb'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Dinosaur, DinosaurModel } from "./type.ts";
import { change } from "./resolve.ts";

const MongoUrl = Deno.env.get("MONGO_URL")

if(!MongoUrl) Deno.exit(1)

const client = new MongoClient(MongoUrl)

await client.connect();
console.log("Conectado correctamente a la base de datos")
const db = client.db("zoo");
const dinosaurCollection = db.collection<DinosaurModel>("dinosaur");

const typeDefs = `#graphql

  type Dinosaur {
    id: String!
    name: String!
    type: String!
  }

  type Query {
    getDinosaur:[Dinosaur!]!
    getDinosaurById(id: String!): Dinosaur
  }

  type Mutation {
    addDinosaur(name:String!, type:String!): Dinosaur!
  }
`

const resolvers = {
  Query: {
    getDinosaur: async():Promise<Dinosaur[]> => {
      const result = await dinosaurCollection.find().toArray()
      const aux = result.map(e => change(e))
      return aux
    },
    getDinosaurById: async(_:unknown,args:{id:string}):Promise<Dinosaur|undefined> => {
      const result = await dinosaurCollection.findOne({_id:new ObjectId(args.id)})
      if(result === undefined) return result
      const aux = change(result!)
      return aux
    }
  },
  Mutation: {
    addDinosaur: async(_:unknown,args:{name:string,type:string}):Promise<Dinosaur> => {
      const { insertedId } = await dinosaurCollection.insertOne({
        name:args.name,
        type:args.type
      })
      return ({
        id: insertedId.toString(),
        name:args.name,
        type:args.type
      })
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

const { url } = await startStandaloneServer(server,{listen:{port:4000}})

console.log(`🚀  Server ready at: ${url}`)
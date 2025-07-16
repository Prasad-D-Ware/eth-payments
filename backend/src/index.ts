import express, { type Request, type Response } from "express";
import prisma from "./lib/prisma";
import { HDNodeWallet } from "ethers";
import { mnemonicToSeedSync } from "bip39";

const PORT = 8080;

const SEED = mnemonicToSeedSync(process.env.MNEMONIC!)

const app = express();

app.use(express.json());

app.post("/signup", async (req : Request , res : Response)=> {
    const { email , password } = req.body;
 
    if(!email || !password) {
        res.json({
            success : false,
            message : "Provide Valid Inputs!"
        })
        return;
    }

	try{

		const newUser = await prisma.user.create({
			data : {
				email : email as string,
				password : password as string
			}
		})
		
		
		if(!newUser){
			res.json({
				success : false,
				message : "Failed to create user!"
			})
			return;
		}
		
		// the address generation logic 
		const hdNode = HDNodeWallet.fromSeed(SEED);
		const derivationPath = `m/44'/60'/${newUser.id}'/0`;
		const child = hdNode.derivePath(derivationPath);
		
		await prisma.user.update({
			where : {
				id : newUser.id
			},
			data : {
				deposit_address : child.address,
				private_key : child.privateKey
			}
		})
	
		res.json({
			success : true,
			message : "User created Successfully!",
			data : newUser.id
		}) 

	}catch ( err : any){
		console.log(err.message)
		res.json({
			success : false,
			message : "Failed to Create User!",
		})
		return;
	}
})

app.get("/get-deposit-address", async (req : Request,res : Response) =>{

	const { user_id } = req.query;

	if(!user_id) {
		res.json({
			status : false,
			message : "No User id provided"
		})
		return;
	}

	try{
		
		const user = await prisma.user.findFirst({
			where : {
				id : parseInt(user_id as string)
			},
			select : {
				deposit_address : true
			}
		})
		
		if(!user){
			res.json({
				status : false,
				message : "No User Found!"
			})
			return;
		}

		res.json({
			success : true,
			message : "Deposit address retrieved!",
			data : user
		})

	}catch(err : any){
		console.log(err.message);
		res.json({
			success : false,
			message : "Failed retrieving deposit address"
		})
		return;
	}
})

app.listen(PORT, async ()=>{
    console.log(`Server running at ` + PORT)
})
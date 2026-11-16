'use client'
import React, { useActionState, useEffect, useState} from "react";
import { Button } from "../ui/button";
import { Pencil, Info, HelpCircle, X } from "lucide-react";
import Image from "next/image";
import { Car, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Circle } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { lookup } from "dns";

export default function PaymentLinksForm(props:{userId:string}){
    const userId = props.userId;
    const supabase = createClient();
    const [cashAppUserName,setCashAppUserName] = useState("");
    const [venmoUserName,setVenmoUserName] = useState("");
    const [cashAppExsists,setCashappExists] = useState(false);
    const [venmoExists,setVenmoExists] = useState(false);
    const [cashAppPopoverOpen, setCashAppPopoverOpen] = useState(false);
    const [venmoPopoverOpen, setVenmoPopoverOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cashAppEditMode, setCashAppEditMode] = useState(false);
    const [venmoEditMode, setVenmoEditMode] = useState(false);
    const [originalCashAppUsername, setOriginalCashAppUsername] = useState("");
    const [originalVenmoUsername, setOriginalVenmoUsername] = useState("");
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        const getExists = async(userId:string) => {
            const {data:existsData , error:existsError} = await supabase
            .from('users')
            .select('venmo_username,cash_app_username')
            .eq('user_id',userId)
            .single();

            if(!existsData || existsError){
                console.error("error getting venmo cashapp username", existsError?.message)
                return;
            }

            setLoading(false);

            // Set existing usernames if they exist
            if(existsData.venmo_username && existsData.venmo_username != ''){
                setVenmoExists(true);
                setVenmoUserName(existsData.venmo_username);
                setOriginalVenmoUsername(existsData.venmo_username);
            }

            if(existsData.cash_app_username && existsData.cash_app_username != ''){
               setCashappExists(true);
               setCashAppUserName(existsData.cash_app_username);
               setOriginalCashAppUsername(existsData.cash_app_username);
            }
        }
        getExists(userId);
    },[userId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const {error:updateUserNameError} = await supabase
            .from('users')
            .update({
                venmo_username: venmoUserName,
                cash_app_username: cashAppUserName,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

            if(updateUserNameError){
                console.error("error updating usernames", updateUserNameError.message)
                throw new Error(updateUserNameError.message)
            }
            
            // Update local state to reflect the changes
            if(venmoUserName) setVenmoExists(true);
            if(cashAppUserName) setCashappExists(true);
            
            // Update original values after successful save
            setOriginalCashAppUsername(cashAppUserName);
            setOriginalVenmoUsername(venmoUserName);
            
            // Exit edit modes after successful save
            setCashAppEditMode(false);
            setVenmoEditMode(false);
            
        } catch (error) {
            console.error("Error updating usernames:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const  handleCashAppSave = async (e:React.FormEvent) => {
        e.preventDefault();

        const {error:updateError} = await supabase
        .from('users')
        .update({
            cash_app_username : cashAppUserName
        })
        .eq('user_id',userId)

        if(updateError){
            throw new Error(updateError.message);
        }

        setCashAppEditMode(false);
    }

    const handleVenmoSave = async(e:React.FormEvent) => {
        e.preventDefault();

        const {data:updateVenmoError} = await supabase
        .from('users')
        .update({venmo_username : venmoUserName})
        .eq('user_id',userId)

        if(updateVenmoError){
            console.error("error updating venmo",updateVenmoError)
            throw new Error(updateVenmoError);
        }
    }

    const handleCashAppEdit = () => {
        setCashAppEditMode(true);
    }

    const handleVenmoEdit = () => {
        setVenmoEditMode(true);
    }

    const handleCashAppCancel = () => {
        setCashAppUserName(originalCashAppUsername);
        setCashAppEditMode(false);
    }

    const handleVenmoCancel = () => {
        setVenmoUserName(originalVenmoUsername);
        setVenmoEditMode(false);
    }

    if(loading){
        return(
            <div className="w-full max-w-4xl mx-auto">
                <Card className="p-6">
                    <CardHeader className="pb-8">
                        <CardTitle className="flex justify-center gap-3 text-xl">
                            <DollarSign className="h-6 w-6"/>
                            Link Payment Services
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8">
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="text-muted-foreground text-sm">Loading payment settings...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return(
        <div className="w-full max-w-4xl mx-auto">
            <Card className="p-6">
                <CardHeader className="pb-8">
                    <CardTitle className="flex justify-center gap-3 text-xl">
                        <DollarSign className="h-6 w-6"/>
                        Link Payment Services
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                        <div className="flex flex-col
                        items-center gap-6 p-4">
                            <div className="flex items-center gap-6 w-md">
                                <Image
                                    src= '/images/cashapp.png'
                                    alt= 'CashApp'
                                    width={32}
                                    height={32}
                                />
                                <div className="flex-1 relative">
                                    <input
                                        id = 'cashAppUsername'
                                        type="text"
                                        value={cashAppUserName}
                                        onChange={(e)=>setCashAppUserName(e.target.value)}
                                        placeholder="Enter Cashapp Username"
                                        disabled={cashAppExsists && !cashAppEditMode}
                                        className={`w-full px-4 py-3 h-8 border border-border rounded-md text-base pr-10 ${
                                            cashAppExsists && !cashAppEditMode ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''
                                        }`}
                                    />
                                    <Popover open={cashAppPopoverOpen} onOpenChange={setCashAppPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-50 dark:to-purple-500/10 rounded-full transition-all duration-200"
                                            >
                                                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent 
                                            side="top" 
                                            className="max-w-sm p-4 bg-card border-2 border-gray-800 shadow-xl rounded-lg"
                                            sideOffset={8}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                                                        <p className="font-semibold text-foreground text-base">Cash App Username Format</p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 hover:bg-muted rounded-full"
                                                        onClick={() => setCashAppPopoverOpen(false)}
                                                    >
                                                        <X className="h-3 w-3 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-foreground/80 leading-relaxed">
                                                    Enter your username without the $ symbol.
                                                </p>
                                                <div className="bg-gradient-to-r from-primary/5 to-purple-50 dark:to-purple-500/10 p-3 rounded-md border border-border">
                                                    <p className="text-sm text-muted-foreground font-medium">Example:</p>
                                                    <p className="text-sm text-foreground/80">If your Cash App is <span className="font-mono bg-muted px-1 rounded">$johnsmith</span>, enter <span className="font-mono bg-primary/10 text-primary px-1 rounded">"johnsmith"</span></p>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {cashAppEditMode ? (
                                    <div className="flex gap-2">
                                        <Button 
                                            type="button"
                                            onClick={handleCashAppCancel}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onSubmit={(e)=>handleCashAppSave(e)}
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button 
                                        id = "cashAppSubmit"
                                        name = "cashAppSubmit"
                                        type="button"
                                        onClick={handleCashAppEdit}
                                        disabled={!cashAppExsists}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-6 w-md">
                                <Image 
                                    src="/images/venmo.png"
                                    alt="Venmo"
                                    width={32}
                                    height={32}
                                />
                                <div className="flex-1 relative">
                                    <input 
                                        type="text"
                                        value = {venmoUserName}
                                        onChange={(e)=>setVenmoUserName(e.target.value)}
                                        placeholder="Enter Venmo Username"
                                        disabled={venmoExists && !venmoEditMode}
                                        className={`w-full px-4 py-3 h-8 border border-border rounded-md text-base pr-10 ${
                                            venmoExists && !venmoEditMode ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''
                                        }`}
                                    />
                                    <Popover open={venmoPopoverOpen} onOpenChange={setVenmoPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-50 dark:to-purple-500/10 rounded-full transition-all duration-200"
                                            >
                                                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent 
                                            side="top" 
                                            className="max-w-sm p-4 bg-card border-2 border-gray-800 shadow-xl rounded-lg"
                                            sideOffset={8}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                                                        <p className="font-semibold text-foreground text-base">Venmo Username Format</p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 hover:bg-muted rounded-full"
                                                        onClick={() => setVenmoPopoverOpen(false)}
                                                    >
                                                        <X className="h-3 w-3 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-foreground/80 leading-relaxed">
                                                    Enter your username without the @ symbol.
                                                </p>
                                                <div className="bg-gradient-to-r from-primary/5 to-purple-50 dark:to-purple-500/10 p-3 rounded-md border border-border">
                                                    <p className="text-sm text-muted-foreground font-medium">Example:</p>
                                                    <p className="text-sm text-foreground/80">If your Venmo is <span className="font-mono bg-muted px-1 rounded">@janesmith</span>, enter <span className="font-mono bg-primary/10 text-primary px-1 rounded">"janesmith"</span></p>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {venmoEditMode ? (
                                    <div className="flex gap-2">
                                        <Button 
                                            type="button"
                                            onClick={handleVenmoCancel}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            id="venmoSubmit"
                                            name="venmoSubmit"
                                            type="submit"
                                            disabled={isSubmitting}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onSubmit={(e) => {handleCashAppSave(e)}}
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button 
                                        type="button"
                                        onClick={handleVenmoEdit}
                                        disabled={!venmoExists}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>
                        {(!cashAppEditMode && !venmoEditMode) && (
                            <Button 
                                type="submit" 
                                className="w-50 self-end" 
                                disabled={isSubmitting || (cashAppExsists && venmoExists)}
                                onSubmit={(e)=> handleSubmit(e)}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Payment Links'}
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

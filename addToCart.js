var price=0;
function addToCart(id)
{
    var priceField=document.getElementById("price"+id).innerHTML;
    price+=priceField;
    document.getElementById("totalCost").innerHTML=price;
    document.getElementById("payButton").style="display:block";
}
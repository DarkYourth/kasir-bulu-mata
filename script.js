function printReceipt() {
    const receiptContent = document.getElementById("receipt").innerHTML;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.open();
    printWindow.document.write(`
        <html>
        <head>
            <title>Struk</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; }
                h2 { text-align: center; }
                ul { list-style: none; padding: 0; }
                li { margin-bottom: 5px; }
            </style>
        </head>
        <body>
            ${receiptContent}
            <script>
                window.onload = function() { window.print(); window.close(); }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
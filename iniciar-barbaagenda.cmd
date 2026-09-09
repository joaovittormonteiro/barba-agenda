@echo off
title BarbaAgenda - Servidor local
cd /d "%~dp0"
echo Iniciando o BarbaAgenda em http://localhost:3000
echo Mantenha esta janela aberta enquanto estiver usando a aplicacao.
echo.
npm run dev
echo.
echo O servidor foi encerrado. Pressione qualquer tecla para fechar.
pause >nul

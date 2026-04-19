$items = @(
    @{day='Prologue'; date='2018-10-04'; url='https://naayaablafz.blogspot.com/2018/10/prologue.html'},
    @{day='Day 1'; date='2018-10-25'; url='https://naayaablafz.blogspot.com/2018/10/jaipur2chandigarh.html'},
    @{day='Day 2'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/chandigarh2manali.html'},
    @{day='Day 3'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/manali2keylong.html'},
    @{day='Day 4'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/keylong2pang.html'},
    @{day='Day 5'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/pang2leh.html'},
    @{day='Day 6'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/leh.html'},
    @{day='Day 7'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/leh2pangong.html'},
    @{day='Day 8'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/pangong2nubra.html'},
    @{day='Day 9'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/nubra2leh.html'},
    @{day='Day 10'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/lehcity.html'},
    @{day='Day 11'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/leh2sonmarg.html'},
    @{day='Day 12'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/sonmarg2jammu.html'},
    @{day='Day 13'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/jammu2chandigarh.html'},
    @{day='Day 14'; date='2018-11-26'; url='https://naayaablafz.blogspot.com/2018/11/chandigarh2jaipur.html'}
)

$result = @()

foreach ($item in $items) {
    try {
        $html = (Invoke-WebRequest -Uri $item.url -UseBasicParsing).Content

        $doc = New-Object -ComObject "HTMLFile"
        $doc.IHTMLDocument2_write($html)
        $doc.Close()

        $titleNode = $doc.getElementsByTagName('h1') | Where-Object { $_.className -like '*post-title*' } | Select-Object -First 1
        $postNode = $doc.getElementsByTagName('div') | Where-Object { $_.className -like 'post hentry*' } | Select-Object -First 1

        $title = if ($null -ne $titleNode) { [System.Net.WebUtility]::HtmlDecode($titleNode.innerText).Trim() } else { $item.day }
        $plain = if ($null -ne $postNode) { [System.Net.WebUtility]::HtmlDecode($postNode.innerText) } else { '' }
        $plain = [regex]::Replace($plain, '\\s+', ' ').Trim()

        $images = @()
        if ($null -ne $postNode) {
            $imgNodes = $postNode.getElementsByTagName('img')
            foreach ($img in $imgNodes) {
                if ($null -ne $img -and $img.src -and $img.src -like 'http*') {
                    $images += $img.src
                }
            }
            $images = $images | Select-Object -Unique
        }

        if ($plain.Length -gt 12000) {
            $plain = $plain.Substring(0, 12000) + ' ...'
        }

        $excerpt = if ($plain.Length -gt 260) { $plain.Substring(0, 260) + '...' } else { $plain }

        $result += [pscustomobject]@{
            day = $item.day
            date = $item.date
            slug = ($item.day.ToLower().Replace(' ', '-'))
            title = $title
            excerpt = $excerpt
            sourceUrl = $item.url
            content = $plain
            coverImage = if ($images.Count -gt 0) { $images[0] } else { $null }
            images = $images
        }
    }
    catch {
        $result += [pscustomobject]@{
            day = $item.day
            date = $item.date
            slug = ($item.day.ToLower().Replace(' ', '-'))
            title = $item.day
            excerpt = 'Import failed for this item.'
            sourceUrl = $item.url
            content = 'Could not import this page automatically.'
        }
    }
}

$outPath = 'd:\IndiBargain\blogs\data\leh-ladakh-journey.json'
$result | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $outPath
Write-Host "Wrote: $outPath"

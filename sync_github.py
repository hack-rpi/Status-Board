import pymongo
import urllib2
import json
import datetime


def getDatabase():
    host = 'proximus.modulusmongo.net'
    port = 27017
    database = 'jutEgu6n'
    username = 'rpi'
    password = 'Jackson1'

    url = 'mongodb://%(username)s:%(password)s@%(host)s:%(port)d/%(database)s' % locals()
    return pymongo.MongoClient(url)[database]


database = getDatabase()

def getCommit(username, repo):
    token = 'ea86855a004a03c2a72c3a7c95ef6a5f05b5dce4'
    url = 'https://api.github.com/repos/%s/%s/commits?access_token=%s' % (username, repo, token)
    try:
        result = urllib2.urlopen(url)
        if result.getcode() != 200:
            raise urllib2.HTTPError()
    except urllib2.HTTPError as e:
        print 'ERROR connecting to Github API at: %s' % url
        return

    github_commits = json.loads(result.read())

    for github_commit in github_commits:
        if database['CommitMessages'].find({'sha': github_commit['sha']}).count():
            break
        database['CommitMessages'].insert({
            'sha': github_commit['sha'],
            'text': github_commit['commit']['message'],
            'date': github_commit['commit']['committer']['date'],
            'fdate': datetime.datetime.strptime(github_commit['commit']['committer']['date'], '%Y-%m-%dT%H:%M:%SZ'),
            'repo': repo,
            'committer_handle': github_commit['committer']['login'] if github_commit['committer'] else github_commit['commit']['committer']['name'],
            'committer_avatar': github_commit['committer']['avatar_url'] if github_commit['committer'] else None,
            'committer_real': github_commit['commit']['committer']['name'],
            # probably not a good a idea to store emails?
            # (do I have access to all of them?)
            'committer_email': github_commit['commit']['committer']['email'],
            'flags': [],
            'total_flags': 0,
        })


for repository in database['RepositoryList'].find():
    getCommit(repository['owner'], repository['name'])
